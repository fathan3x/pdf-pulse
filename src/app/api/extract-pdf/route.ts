import "pdf-parse/worker";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8ArrayFile = new Uint8Array(arrayBuffer);

    const parser = new PDFParse({ data: uint8ArrayFile });
    const result = await parser.getText();

    await parser.destroy();

    return NextResponse.json(
      { success: true, fileName: file.name, text: result.text },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to parse form data" },
      { status: 500 },
    );
  }
}
