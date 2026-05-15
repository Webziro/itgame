import { prisma } from "@database/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { difficulty: "HARD" },
    });

    // If no questions in DB, fallback to some AI-generated ones or just return empty
    // Actually, we should trigger a refill if empty
    if (questions.length < 10) {
       // We can't easily trigger the AI refill from a GET route due to safety, 
       // but we'll return what we have and shuffle
    }

    const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, 10);

    return NextResponse.json(shuffled);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
