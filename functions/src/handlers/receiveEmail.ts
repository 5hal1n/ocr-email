import { Timestamp } from "firebase-admin/firestore";
import { Resend } from "resend";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as logger from "firebase-functions/logger";
import { parseDocument } from "../lib/upstage/documentParse";
import { generateChatResponse } from "../lib/upstage/chat";
import type { EmailReceivedEvent } from "../types/resend";

export async function receiveEmailHandler(payload: EmailReceivedEvent) {
  // Secret Manager from environment variables
  const resendApiKey = process.env.RESEND_API_KEY;
  const upstageApiKey = process.env.UPSTAGE_API_KEY;

  if (!resendApiKey || !upstageApiKey) {
    throw new Error("Missing required API keys");
  }

  const resend = new Resend(resendApiKey);
  const db = getFirestore();
  const storage = getStorage();

  if (payload.type !== "email.received") {
    logger.info("Ignoring non-email event", { type: payload.type });
    return;
  }

  logger.info("Processing email", {
    emailId: payload.data.email_id,
    from: payload.data.from,
    attachmentCount: payload.data.attachments.length,
  });

  const { data: attachments } = await resend.emails.receiving.attachments.list({
    emailId: payload.data.email_id,
  });

  if (!attachments || attachments.data.length === 0) {
    logger.warn("No attachments found", { emailId: payload.data.email_id });
    return;
  }

  for (const attachment of attachments.data) {
    try {
      logger.info("Processing attachment", {
        filename: attachment.filename,
        contentType: attachment.content_type,
      });

      // Download attachment
      const response = await fetch(attachment.download_url);
      if (!response.ok) {
        logger.error(`Failed to download ${attachment.filename}`, {
          status: response.status,
        });
        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // OCR processing
      const ocrResult = await parseDocument(new Blob([buffer]), {
        apiKey: upstageApiKey,
      });
      logger.info("OCR completed", {
        textLength: ocrResult.content.markdown.length,
      });

      // AI extraction
      const prompt = `
以下のOCR結果から領収書の内容を抽出してください。
抽出する内容は以下の通りです：
- 店舗名（merchant_name）
- 合計金額（total_amount）

OCR結果：
${ocrResult.content.markdown}
      `;

      const chatResponse = await generateChatResponse(prompt, upstageApiKey);
      logger.info("AI extraction completed", chatResponse);

      // Upload image to Firebase Storage
      const bucket = storage.bucket();
      const fileName = `receipts/${Date.now()}_${attachment.filename}`;
      const file = bucket.file(fileName);

      await file.save(buffer, {
        metadata: {
          contentType: attachment.content_type,
        },
      });

      // Get public URL
      await file.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Save to Firestore
      const docRef = await db.collection("receipts").add({
        merchant_name: chatResponse?.merchant_name || "不明",
        total_amount: chatResponse?.total_amount || -1,
        image_url: imageUrl,
        created_at: Timestamp.now(),
      });

      logger.info("Receipt saved to Firestore", {
        receiptId: docRef.id,
        merchantName: chatResponse?.merchant_name,
      });
    } catch (error) {
      logger.error("Failed to process attachment", {
        filename: attachment.filename,
        error: error instanceof Error ? error.message : String(error),
      });
      // Continue processing other attachments even if one fails
      continue;
    }
  }
}
