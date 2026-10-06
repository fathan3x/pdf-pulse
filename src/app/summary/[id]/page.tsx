"use client";

import { useCompletion } from "@ai-sdk/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

export default function SummaryById() {
  const [extractedText, setExtractedText] = useState("");
  const hasTriggered = useRef(false);

  const { completion, complete, isLoading, error } = useCompletion({
    api: "/api/summarize",
  });

  useEffect(() => {
    const text = sessionStorage.getItem("pdf_text");

    if (!text) {
      return;
    }

    setExtractedText(text);

    async function sendBody() {
      await complete("", {
        body: {
          text: text,
        },
      });
    }

    if (!hasTriggered.current) {
      hasTriggered.current = true;
      sendBody();
    }
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-10 space-y-10">
      <Link href="/" className="text-2xl font-black block">
        PDF PULSE
      </Link>
      <section className="space-y-6">
        <h2 className="font-bold">SUMMARY</h2>
        {isLoading && (
          <div className="flex items-center text-sm gap-2 bg-neutral-900 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Generating summary...</span>
          </div>
        )}
        {(completion || isLoading) && (
          <div className="typeset typeset-docs">
            <Streamdown>{completion}</Streamdown>
            {isLoading && !completion && (
              <span className="text-muted-foreground animate-pulse">
                Analyzing document structure and key takeaways...
              </span>
            )}
          </div>
        )}
        {error && (
          <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md text-sm flex items-center justify-between">
            <span>Failed to generate summary. Please check your API key.</span>
          </div>
        )}
      </section>
      <section className="space-y-6">
        <h2 className="font-bold">EXTRACTED TEXT</h2>
        <p className="p-8 bg-neutral-900">{extractedText}</p>
      </section>
    </main>
  );
}
