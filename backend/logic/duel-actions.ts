'use server';

import { auth } from "@/auth";
import { prisma } from "@database/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { DuelStatus } from "@/generated/client";

export async function joinDuel(wager: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 1. Check balance
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.walletBalance + user.bonusBalance) < wager) {
    throw new Error("Insufficient balance");
  }

  return await prisma.$transaction(async (tx) => {
    // 2a. Check if user ALREADY has a waiting duel with this wager
    const existingEntry = await tx.duel.findFirst({
      where: {
        wager: wager,
        status: "WAITING",
        participants: {
          some: { userId: userId }
        }
      }
    });

    if (existingEntry) {
      return { duelId: existingEntry.id, status: "WAITING" };
    }

    // 2b. Look for SOMEONE ELSE'S waiting duel
    const waitingDuel = await tx.duel.findFirst({
      where: {
        wager: wager,
        status: "WAITING",
        participants: {
          none: { userId: userId } 
        }
      },
      include: { participants: true }
    });

    // 3. Deduct wager
    let fromBonus = Math.min(user.bonusBalance, wager);
    let fromWallet = wager - fromBonus;

    await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: fromWallet },
        bonusBalance: { decrement: fromBonus },
        bonusWagered: { increment: fromBonus }
      }
    });

    await tx.transaction.create({
      data: {
        userId: userId,
        type: "WAGER",
        amount: wager,
        status: "SUCCESS",
        providerRef: `wager_duel_${userId}_${Date.now()}`,
        metadata: { type: "DUEL", wager }
      }
    });

    if (waitingDuel) {
      // Join existing duel
      const duel = await tx.duel.update({
        where: { id: waitingDuel.id },
        data: {
          status: "ACTIVE",
          participants: {
            create: { userId: userId }
          }
        },
        include: { participants: true }
      });

      // Fetch questions (assuming some exist)
      const questions = await tx.question.findMany({
        where: { id: { in: duel.questions } }
      });

      // Notify the first participant
      await pusherServer.trigger(`user-${waitingDuel.participants[0].userId}`, "duel-started", {
        duelId: duel.id,
        questions
      });

      return { duelId: duel.id, questions, status: "STARTED" };
    } else {
      // Create new duel
      // Pick 5 random questions for the duel
      const allQuestions = await tx.question.findMany({
        where: { difficulty: "MEDIUM" },
        select: { id: true }
      });
      
      const selectedIds = allQuestions
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(q => q.id);

      const duel = await tx.duel.create({
        data: {
          wager,
          status: "WAITING",
          questions: selectedIds,
          participants: {
            create: { userId: userId }
          }
        }
      });

      return { duelId: duel.id, status: "WAITING" };
    }
  });
}

export async function joinSoloDuel(wager: number) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized: Please sign in to play");

  let retries = 3;
  while (retries > 0) {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Check for existing UNFINISHED solo duel
        const existingSolo = await tx.duel.findFirst({
          where: {
            status: "ACTIVE",
            participants: {
              every: { userId: userId }
            }
          },
          include: { participants: true }
        });

        if (existingSolo) {
          const qIds = existingSolo.questions || [];
          const questions = await tx.question.findMany({
            where: { id: { in: qIds } }
          });
          if (questions.length > 0) {
            return { duelId: existingSolo.id, questions: JSON.parse(JSON.stringify(questions)) };
          }
        }

        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");
        
        const totalBalance = user.walletBalance + user.bonusBalance;
        if (totalBalance < wager) {
          throw new Error(`Insufficient balance. You need ₦${wager} to enter this arena.`);
        }

        // 2. Fetch Questions FIRST (ensure we have enough)
        const questions = await tx.question.findMany({
          where: { difficulty: "MEDIUM" },
          take: 5
        });

        if (questions.length < 5) {
          throw new Error("Arena is under maintenance (Not enough questions). Please try again later.");
        }

        // 3. Deduct wager (Check bonus first)
        let fromBonus = Math.min(user.bonusBalance, wager);
        let fromWallet = wager - fromBonus;

        const ref = `DUEL_SOLO_${userId}_${Date.now()}`;
        await tx.user.update({
          where: { id: userId },
          data: { 
            walletBalance: { decrement: fromWallet },
            bonusBalance: { decrement: fromBonus },
            bonusWagered: { increment: fromBonus },
            transactions: {
              create: {
                amount: wager,
                type: "WAGER",
                status: "SUCCESS",
                providerRef: ref,
                description: `Solo Arena Wager: ₦${wager}`,
                metadata: { type: "SOLO_DUEL" }
              }
            }
          }
        });

        // 4. Create Solo Duel
        const duel = await tx.duel.create({
          data: {
            wager,
            status: "ACTIVE",
            questions: questions.map(q => q.id),
            participants: {
              create: { userId }
            }
          }
        });

        return { duelId: duel.id, questions: JSON.parse(JSON.stringify(questions)) };
      });
    } catch (err: any) {
      if (err.message?.includes('connection') || err.labels?.includes('TransientTransactionError')) {
        retries--;
        if (retries === 0) throw err;
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      throw err;
    }
  }
}

export async function submitSoloScore(wager: number, score: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Rule: Must answer ALL 5 correctly to win 2x
  if (score === 5) {
    const winAmount = wager * 2;
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: winAmount } }
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: "WIN",
          amount: winAmount,
          status: "SUCCESS",
          providerRef: `solo_win_${userId}_${Date.now()}`,
          metadata: { type: "SOLO_WIN", wager }
        }
      })
    ]);
    return { result: "WIN", winAmount };
  }

  return { result: "LOSS" };
}

export async function cancelDuel(duelId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  return await prisma.$transaction(async (tx) => {
    const duel = await tx.duel.findUnique({
      where: { id: duelId },
      include: { participants: true }
    });

    if (!duel || duel.status !== "WAITING") throw new Error("Cannot cancel this duel");
    if (duel.participants[0].userId !== userId) throw new Error("Unauthorized");

    // Refund
    await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: duel.wager } }
    });

    await tx.transaction.create({
      data: {
        userId,
        type: "WIN", // Refund
        amount: duel.wager,
        status: "SUCCESS",
        providerRef: `refund_duel_${duelId}_${userId}`,
        metadata: { type: "REFUND", duelId }
      }
    });

    await tx.duel.update({
      where: { id: duelId },
      data: { status: "CANCELLED" }
    });

    return { success: true };
  });
}


export async function submitDuelScore(duelId: string, score: number, timeTaken: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const result = await prisma.$transaction(async (tx) => {
    const participant = await tx.duelParticipant.findFirst({
      where: { duelId, userId }
    });

    if (!participant) throw new Error("Participant not found");
    if (participant.hasFinished) throw new Error("Already submitted");

    await tx.duelParticipant.update({
      where: { id: participant.id },
      data: {
        score,
        timeTaken,
        hasFinished: true
      }
    });

    const duel = await tx.duel.findUnique({
      where: { id: duelId },
      include: { participants: true }
    });

    if (!duel) throw new Error("Duel not found");

    const allFinished = duel.participants.every(p => p.hasFinished);

    if (allFinished) {
      return { duel, resolve: true };
    }

    return { duel, resolve: false };
  });

  if (result.resolve) {
    await resolveDuel(duelId);
  }

  return { success: true };
}

async function resolveDuel(duelId: string) {
  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: { participants: true }
  });

  if (!duel || duel.status !== "ACTIVE") return;

  const [p1, p2] = duel.participants;
  let winnerId: string | null = null;

  if (p1.score > p2.score) {
    winnerId = p1.userId;
  } else if (p2.score > p1.score) {
    winnerId = p2.userId;
  } else {
    // Tie breaker: timeTaken (lower is better)
    if (p1.timeTaken < p2.timeTaken) {
      winnerId = p1.userId;
    } else if (p2.timeTaken < p1.timeTaken) {
      winnerId = p2.userId;
    } else {
      // Absolute tie - split? Or pick one? Let's split for fairness in MVP.
      winnerId = null; 
    }
  }

  const winAmount = duel.wager * 1.8; // 10% house fee per player = 20% total fee, or 10% total? 
  // Let's say house takes 10% of the total pot (2 * wager * 0.9).

  await prisma.$transaction(async (tx) => {
    if (winnerId) {
      const totalPot = duel.wager * 2;
      const payout = totalPot * 0.9; // 10% fee

      await tx.user.update({
        where: { id: winnerId },
        data: { walletBalance: { increment: payout } }
      });

      await tx.transaction.create({
        data: {
          userId: winnerId,
          type: "WIN",
          amount: payout,
          status: "SUCCESS",
          providerRef: `win_duel_${duelId}_${winnerId}`,
          metadata: { duelId, type: "DUEL_WIN" }
        }
      });

      await tx.duel.update({
        where: { id: duelId },
        data: { status: "FINISHED", winnerId }
      });
    } else {
      // Draw: Refund both (minus small fee maybe? No, let's refund full for draw)
      for (const p of duel.participants) {
        await tx.user.update({
          where: { id: p.userId },
          data: { walletBalance: { increment: duel.wager } }
        });
        
        await tx.transaction.create({
          data: {
            userId: p.userId,
            type: "WIN", // Technically a refund
            amount: duel.wager,
            status: "SUCCESS",
            providerRef: `refund_duel_${duelId}_${p.userId}`,
            metadata: { duelId, type: "DUEL_DRAW" }
          }
        });
      }

      await tx.duel.update({
        where: { id: duelId },
        data: { status: "FINISHED" }
      });
    }
  });

  // Notify both players
  for (const p of duel.participants) {
    await pusherServer.trigger(`user-${p.userId}`, "duel-resolved", {
      duelId,
      winnerId,
      result: winnerId === p.userId ? "WIN" : (winnerId === null ? "DRAW" : "LOSS")
    });
  }
}
