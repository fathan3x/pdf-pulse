import { openai } from "@ai-sdk/openai";
import {
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response("No text provided for summarization", {
        status: 400,
      });
    }

    const result = streamText({
      model: openai("gpt-6-luna"),
      instructions:
        "You are an expert executive assistant. Provide a clear, concise maximum 3 bullet-point summary of the following document. Highlight key metrics, decisions, or action items.",
      prompt: text,
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("Summarization route error:", error);
    return new Response("Failed to generate summary", { status: 500 });
  }
}
