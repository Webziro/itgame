import { NextResponse } from 'next/server';
import { prisma } from '@database/prisma';
import { pusherServer } from '@database/pusher';

export async function GET(request: Request) {
  // Security check: Only allow if a secret matches (add CRON_SECRET to Vercel)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('🏆 Starting Friday Night Trivia Pool...');
  
  try {
    const pool = await prisma.pool.create({
      data: {
        startTime: new Date(),
        entryFee: 500,
        status: 'LIVE'
      }
    });

    await pusherServer.trigger('global-events', 'pool-started', {
      poolId: pool.id,
      message: 'Friday Night Trivia is LIVE! Join the pool now.'
    });

    return NextResponse.json({ success: true, poolId: pool.id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
