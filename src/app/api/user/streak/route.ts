import { auth } from "@/auth";
import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streak: true, lastLogin: true }
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const now = new Date();
  const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
  
  let newStreak = user.streak;

  if (!lastLogin) {
    // First time login
    newStreak = 1;
  } else {
    const diffTime = now.getTime() - lastLogin.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays >= 1 && diffDays < 2) {
      // Consecutive day
      newStreak += 1;
    } else if (diffDays >= 2) {
      // Missed a day
      newStreak = 1;
    }
    // If diffDays < 1, it's the same day, don't change streak
  }

  // Update user with new streak and lastLogin
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      streak: newStreak,
      lastLogin: now
    }
  });

  return NextResponse.json({ streak: newStreak });
}

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || user.streak < 7) {
        return NextResponse.json({ error: "Streak not complete" }, { status: 400 });
    }

    // Check if already claimed this week (using metadata)
    const existing = await prisma.transaction.findFirst({
        where: {
            userId: user.id,
            type: "WIN",
            description: "7-Day Streak Bonus",
            createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        }
    });

    if (existing) {
        return NextResponse.json({ error: "Bonus already claimed this week" }, { status: 400 });
    }

    const bonusAmount = 500;

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: {
                bonusBalance: { increment: bonusAmount },
                streak: 0 // Reset after claim
            }
        }),
        prisma.transaction.create({
            data: {
                userId: user.id,
                type: "WIN",
                amount: bonusAmount,
                status: "SUCCESS",
                description: "7-Day Streak Bonus",
                metadata: { path: "streak_bonus" }
            }
        })
    ]);

    return NextResponse.json({ success: true, amount: bonusAmount });
}
