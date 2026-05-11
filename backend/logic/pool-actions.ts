'use server';

import { auth } from "@/auth";
import { prisma } from "@database/prisma";

export async function getActivePool() {
  return await prisma.pool.findFirst({
    where: { status: 'LIVE' },
    include: { _count: { select: { participants: true } } }
  });
}

export async function joinPool(poolId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const pool = await prisma.pool.findUnique({
    where: { id: poolId }
  });

  if (!pool || pool.status !== 'LIVE') throw new Error("Pool is not active");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.walletBalance + user.bonusBalance) < pool.entryFee) {
    throw new Error("Insufficient balance");
  }

  // Check if already joined
  const existing = await prisma.participant.findFirst({
    where: { poolId, userId }
  });
  if (existing) throw new Error("Already joined this pool");

  return await prisma.$transaction(async (tx) => {
    // Deduct fee
    let fromBonus = Math.min(user.bonusBalance, pool.entryFee);
    let fromWallet = pool.entryFee - fromBonus;

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
        userId,
        type: "WAGER",
        amount: pool.entryFee,
        status: "SUCCESS",
        providerRef: `wager_pool_${poolId}_${userId}`,
        metadata: { type: "POOL_ENTRY", poolId }
      }
    });

    const participant = await tx.participant.create({
      data: {
        poolId,
        userId
      }
    });

    await tx.pool.update({
      where: { id: poolId },
      data: { totalStaked: { increment: pool.entryFee } }
    });

    // Fetch questions for the pool (10 hard questions)
    const questions = await tx.question.findMany({
      where: { difficulty: "HARD" },
      take: 10
    });

    return { participantId: participant.id, questions };
  });
}

export async function submitPoolScore(participantId: string, score: number, timeTaken: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      score,
      timeTaken
    }
  });

  return { success: true };
}

export async function processPoolPayout(poolId: string) {
  const pool = await prisma.pool.findUnique({
    where: { id: poolId },
    include: { participants: true }
  });

  if (!pool || pool.status !== 'LIVE') throw new Error("Invalid pool state");

  // Sort participants by score (desc) and timeTaken (asc)
  const winners = pool.participants.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeTaken - b.timeTaken;
  }).slice(0, 3);

  const poolTotal = pool.totalStaked;
  const payoutPool = poolTotal * 0.9; // 10% system fee
  const distribution = [0.6, 0.2, 0.1]; // 60%, 20%, 10%

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < winners.length; i++) {
      const amount = payoutPool * distribution[i];
      await tx.user.update({
        where: { id: winners[i].userId },
        data: { walletBalance: { increment: amount } }
      });

      await tx.transaction.create({
        data: {
          userId: winners[i].userId,
          type: "WIN",
          amount: amount,
          status: "SUCCESS",
          providerRef: `win_pool_${poolId}_${winners[i].userId}`,
          metadata: { poolId, rank: i + 1 }
        }
      });
    }

    await tx.pool.update({
      where: { id: poolId },
      data: { status: 'COMPLETED' }
    });
  });

  return { winners: winners.length };
}
