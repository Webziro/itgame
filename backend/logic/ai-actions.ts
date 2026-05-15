'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@database/prisma";
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// The SDK version in package.json might not support the options object in constructor
// but we'll try to set it via the model options instead if this fails.



export async function refillQuestionPool(difficulty: 'EASY' | 'MEDIUM' | 'HARD', count: number = 10) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

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

    // Use direct fetch to hit the stable v1 API
    // Using gemini-2.0-flash-lite as it typically has a much higher free-tier quota
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;


    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("Empty response from Gemini");

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
    // 1. Delete all questions
    await prisma.question.deleteMany({});

    // 2. Refill for all difficulties
    // Sequential to avoid rate limits
    await refillQuestionPool("EASY", 15);
    await refillQuestionPool("MEDIUM", 15);
    await refillQuestionPool("HARD", 15);

    return { success: true, message: "Database nuked and refilled with 45 fresh AI questions." };
  } catch (error: any) {
    console.error("Nuke Error:", error);
    return { success: false, error: error.message };
  }
}


