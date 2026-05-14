import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const wins = await prisma.transaction.findMany({
      where: {
        type: "WIN",
        status: "SUCCESS"
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });

    const activities = wins.map(win => ({
      user: win.user?.name || "Anonymous",
      prize: `₦${win.amount.toLocaleString()}`,
      type: win.description || "Trivia Win",
      initial: (win.user?.name?.[0] || "U").toUpperCase()
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Failed to fetch activities", error);
    return NextResponse.json({ activities: [] }, { status: 500 });
  }
}
