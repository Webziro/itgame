import { nukeAndRefillQuestions } from "@/../backend/logic/ai-actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await nukeAndRefillQuestions();
    if (res.success) {
      return new NextResponse(
        `<h1>Success!</h1><p>${res.message}</p><p>Available models: ${modelNames}</p><p><a href="/dashboard">Return to Dashboard</a></p>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    } else {
      return new NextResponse(
        `<h1>Error</h1><p>${res.error}</p><p><strong>Your Key supports these models:</strong><br/> ${modelNames}</p>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  } catch (error: any) {
    return new NextResponse(`<h1>Fatal Error</h1><p>${error.message}</p>`, { status: 500 });
  }
}

