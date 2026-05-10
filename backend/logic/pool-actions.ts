'use server';

import { prisma } from "@database/prisma";

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
