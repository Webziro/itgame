'use server';

import { prisma } from "@/lib/prisma";
import { Difficulty } from "@prisma/client";
import { parse } from "csv-parse/sync";

export async function uploadQuestionsCsv(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const text = await file.text();
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
  });

  const questions = records.map((r: any) => ({
    content: r.content,
    options: r.options.split("|"),
    answerIndex: parseInt(r.answerIndex),
    difficulty: r.difficulty as Difficulty,
    category: r.category || "General",
  }));

  await prisma.question.createMany({
    data: questions,
  });

  return { count: questions.length };
}

export async function adjustUserBalance(userId: string, amount: number, type: "wallet" | "bonus") {
  const field = type === "wallet" ? "walletBalance" : "bonusBalance";
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      [field]: { increment: amount }
    }
  });
}
