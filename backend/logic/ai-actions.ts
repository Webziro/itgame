'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@database/prisma";
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function refillQuestionPool(difficulty: 'EASY' | 'MEDIUM' | 'HARD', count: number = 10) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      // For now, allow during development, but check in production
      if (process.env.NODE_ENV === 'production') {
        throw new Error("Unauthorized: Admin access required");
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ${count} unique trivia questions for a real-money game.
    Difficulty: ${difficulty}.
    Category: Mix of General Knowledge, Science, Tech, Sports, and Nigerian History.
    
    Return EXACTLY a JSON array of objects with this structure:
    [
      {
        "content": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answerIndex": 0,
        "category": "Science"
      }
    ]
    
    Rules:
    1. Ensure there is only ONE correct answer.
    2. options must have exactly 4 items.
    3. answerIndex must be between 0 and 3.
    4. Questions must be engaging and accurate.
    5. No markdown formatting, just the raw JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Use regex to extract the JSON array from the response text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not find a valid JSON array in AI response: " + text);
    
    const questions = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(questions)) throw new Error("Invalid AI response format");

    const createdCount = await prisma.question.createMany({
      data: questions.map((q: any) => ({
        content: q.content,
        options: q.options,
        answerIndex: q.answerIndex,
        difficulty: difficulty,
        category: q.category || "General"
      }))
    });

    return { success: true, count: createdCount.count };
  } catch (error: any) {
    console.error("AI Question Generation Error:", error);
    return { success: false, error: error.message };
  }
}

export async function nukeAndRefillQuestions() {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    
    // Safety: In production, strictly check for ADMIN role
    if (process.env.NODE_ENV === 'production' && (session.user as any).role !== 'ADMIN') {
      return { success: false, error: "Admin access required" };
    }

    // 1. Delete all questions
    await prisma.question.deleteMany({});

    // 2. Refill for all difficulties
    // We do them sequentially or in parallel depending on API limits
    await Promise.all([
      refillQuestionPool("EASY", 15),
      refillQuestionPool("MEDIUM", 15),
      refillQuestionPool("HARD", 15)
    ]);

    return { success: true, message: "Database nuked and refilled with 45 fresh AI questions." };
  } catch (error: any) {
    console.error("Nuke Error:", error);
    return { success: false, error: error.message };
  }
}

