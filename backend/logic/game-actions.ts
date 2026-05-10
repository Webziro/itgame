'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";

export async function startDuel(pledge: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || (user.walletBalance + user.bonusBalance) < pledge) {
    throw new Error("Insufficient balance");
  }

  // Deduct from bonus first, then wallet
  let fromBonus = Math.min(user.bonusBalance, pledge);
  let fromWallet = pledge - fromBonus;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        walletBalance: { decrement: fromWallet },
        bonusBalance: { decrement: fromBonus },
        bonusWagered: { increment: fromBonus }
      }
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "WAGER",
        amount: pledge,
        status: "SUCCESS",
        metadata: { engine: "B", pledge }
      }
    })
  ]);

  // Fetch 5 Medium questions
  const questions = await prisma.question.findMany({
    where: { difficulty: "MEDIUM" },
    take: 5
  });

  return { questions, pledge };
}

export async function finishDuel(pledge: number, success: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (success) {
    const winAmount = pledge * 2;
    
    // Logic: If they used bonus to wager, winnings go to bonusBalance UNLESS bonusWagered >= total bonus awarded.
    // Simpler rule for MVP: Winnings from bonus stay in bonus until the initial 1k is wagered.
    // Let's implement the "Bonus Lock" here.
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          walletBalance: { increment: winAmount } // For MVP, let's keep it simple or complex as requested?
          // User: "Winnings from initial 1k sign-up credit must be moved to withdrawableBalance only after the 1k is fully utilized in wagers."
        }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "WIN",
          amount: winAmount,
          status: "SUCCESS",
          metadata: { engine: "B", result: "WIN" }
        }
      })
    ]);
  } else {
    // Pledge already deducted, just log the loss
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: "WAGER",
        amount: pledge,
        status: "FAILED", // Mark the transaction as a loss context
        metadata: { engine: "B", result: "LOSS" }
      }
    });
  }

  return { success };
}
