import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Get the current upcoming pool
    const pool = await prisma.pool.findFirst({
      where: { status: "UPCOMING" },
      orderBy: { startTime: 'asc' },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!pool) {
      return NextResponse.json({ 
        active: false, 
        message: "No upcoming pools scheduled. Check back soon!" 
      });
    }

    // 2. Logic for Registration Window
    // Registration opens 1 hour after the LAST completed pool ended
    // Registration closes 1 hour before THIS pool starts
    const lastPool = await prisma.pool.findFirst({
      where: { status: "COMPLETED" },
      orderBy: { startTime: 'desc' }
    });

    const now = new Date();
    const startTime = new Date(pool.startTime);
    const regCloses = new Date(startTime.getTime() - (60 * 60 * 1000));
    
    let regOpens = new Date(0); // Default to past
    if (lastPool) {
      // Assuming lastPool has an endTime or we use a standard duration
      // For now, let's assume pools last 1 hour and opens 1 hour after that.
      regOpens = new Date(lastPool.startTime.getTime() + (2 * 60 * 60 * 1000)); 
    }

    const isRegistrationOpen = now >= regOpens && now <= regCloses;

    return NextResponse.json({
      active: true,
      poolId: pool.id,
      startTime: pool.startTime,
      entryFee: pool.entryFee,
      participantCount: pool._count.participants,
      totalPrize: pool.totalStaked * 0.9, // 90% goes to prize pool
      isRegistrationOpen,
      regOpens,
      regCloses,
      message: isRegistrationOpen 
        ? "Registration is OPEN!" 
        : now < regOpens 
          ? "Registration opens 1 hour after the last pool." 
          : "Registration is closed for this pool."
    });
  } catch (error) {
    return NextResponse.json({ active: false }, { status: 500 });
  }
}
