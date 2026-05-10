import cron from 'node-cron';
import { prisma } from '@database/prisma';
import { pusherServer } from '@database/pusher';
import { processPoolPayout } from '@logic/pool-actions';

console.log('🚀 TriviaWin Background Worker Started...');

// Schedule: Friday Night Trivia at 7:00 PM (19:00)
// Format: minute hour day-of-month month day-of-week
cron.schedule('0 19 * * 5', async () => {
  console.log('🏆 Starting Friday Night Trivia Pool...');
  
  try {
    // 1. Create the Pool record
    const pool = await prisma.pool.create({
      data: {
        startTime: new Date(),
        entryFee: 500, // Example entry fee
        status: 'LIVE'
      }
    });

    // 2. Broadcast via Pusher
    await pusherServer.trigger('global-events', 'pool-started', {
      poolId: pool.id,
      message: 'Friday Night Trivia is LIVE! Join the pool now.'
    });

    console.log(`✅ Pool ${pool.id} initialized and broadcasted.`);

    // 3. Schedule Payout (e.g., 2 hours later at 9:00 PM)
    setTimeout(async () => {
      console.log(`💰 Processing payouts for Pool ${pool.id}...`);
      await processPoolPayout(pool.id);
      console.log('✅ Payouts completed.');
    }, 2 * 60 * 60 * 1000);

  } catch (error) {
    console.error('❌ Error in Friday Night Trivia schedule:', error);
  }
});

// Health check log every hour
cron.schedule('0 * * * *', () => {
  console.log('👷 Worker health check: Standing by for Friday Night...');
});
