import { NextResponse } from 'next/server';
import { prisma } from '@database/prisma';
import { processPoolPayout } from '@logic/pool-actions';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const activePool = await prisma.pool.findFirst({
      where: { status: 'LIVE' },
      orderBy: { createdAt: 'desc' }
    });

    if (!activePool) {
      return NextResponse.json({ success: true, message: 'No active pool found to payout.' });
    }

    console.log(`💰 Processing payouts for Pool ${activePool.id}...`);
    const result = await processPoolPayout(activePool.id);

    return NextResponse.json({ success: true, message: 'Payouts completed', result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
