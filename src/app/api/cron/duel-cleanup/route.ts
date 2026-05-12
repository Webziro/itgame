import { NextResponse } from 'next/server';
import { prisma } from '@database/prisma';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Find duels waiting for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const staleDuels = await prisma.duel.findMany({
      where: {
        status: 'WAITING',
        createdAt: { lt: fiveMinutesAgo }
      },
      include: { participants: true }
    });

    console.log(`🧹 Found ${staleDuels.length} stale duels to cleanup...`);

    for (const duel of staleDuels) {
      await prisma.$transaction(async (tx) => {
        // Refund each participant (usually only one in WAITING)
        for (const p of duel.participants) {
          await tx.user.update({
            where: { id: p.userId },
            data: { walletBalance: { increment: duel.wager } }
          });

          await tx.transaction.create({
            data: {
              userId: p.userId,
              type: "WIN", // Refund
              amount: duel.wager,
              status: "SUCCESS",
              providerRef: `auto_refund_${duel.id}_${p.userId}`,
              description: `Auto-Refund: No opponent found for 1v1 Arena`,
              metadata: { duelId: duel.id, type: "AUTO_REFUND" }
            }
          });
        }

        await tx.duel.update({
          where: { id: duel.id },
          data: { status: 'CANCELLED' }
        });
      });
    }

    return NextResponse.json({ success: true, count: staleDuels.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
