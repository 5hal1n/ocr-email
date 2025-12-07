"use server";

import { supabase } from "@/lib/supabase";
import { parseDocument } from "@/lib/upstage/documentParse";

export async function processAndSaveDocument(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  try {
    // 1. Process with Upstage OCR
    // We need to pass the API key explicitly or ensure it's in process.env.UPSTAGE_API_KEY
    const ocrResult = await parseDocument(file);

    // 2. Save to Supabase
    const { data, error } = await supabase
      .from("ocr_documents")
      .insert({
        filename: file.name,
        content_html: ocrResult.content.html,
        content_markdown: ocrResult.content.markdown,
        content_text: ocrResult.content.text,
        raw_response: ocrResult,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to save to Supabase: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error processing document:", error);
    return { success: false, error: (error as Error).message };
  }
}
