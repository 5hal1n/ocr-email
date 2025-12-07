import { createClient } from "@/lib/supabase/server";
import { generateChatResponse } from "@/lib/upstage/chat";
import { parseDocument } from "@/lib/upstage/documentParse";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * 添付ファイルの定義
 */
export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  content_disposition: string; // 例: "inline", "attachment"
  content_id?: string; // インライン画像の場合などに付与されるため、オプショナルとして定義推奨
}

/**
 * メール本文データの定義
 */
export interface EmailData {
  email_id: string;
  created_at: string; // ISO 8601形式の日時文字列
  from: string;
  to: string[];
  bcc: string[];
  cc: string[];
  message_id: string;
  subject: string;
  attachments: EmailAttachment[];
}

/**
 * イベント全体の定義（ルートオブジェクト）
 */
export interface EmailReceivedEvent {
  type: "email.received"; // リテラル型を使用（他のイベントと判別しやすくするため）
  created_at: string;
  data: EmailData;
}

const resend = new Resend("re_Z8joLx9W_KTiTHiEdVjQi17DqCa12j7Fn");

export const POST = async (request: NextRequest) => {
  const receivedData: EmailReceivedEvent = await request.json();
  if (receivedData.type === "email.received") {
    const { data: attachments } =
      await resend.emails.receiving.attachments.list({
        emailId: receivedData.data.email_id,
      });
    if (attachments !== null) {
      for (const attachment of attachments.data) {
        const response = await fetch(attachment.download_url);
        if (!response.ok) {
          console.error(`Failed to download ${attachment.filename}`);
          continue;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const ocrResult = await parseDocument(new Blob([buffer]), {
          apiKey: "up_Y4sxIMWwlHx0WUyFRShbwcXEzxhVB",
        });
        console.info("1. completed ocr parsing:", ocrResult);
        const prompt = `
        以下のOCR結果から領収書の内容を抽出してください。
        抽出する内容は以下の通りです：
        - 店舗名（merchant_name）
        - 合計金額（total_amount）

        OCR結果：
        ${ocrResult.content.markdown}
        `
        const chatResponse = await generateChatResponse(prompt);
        console.info("2. completed chat response:", chatResponse);
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("receipts")
          .insert({
            merchant_name: chatResponse?.merchant_name || "不明",
            total_amount: chatResponse?.total_amount || -1,
            image_url: attachment.download_url,
          })
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
        } else {
          console.info("3. completed supabase insert:", data);
        }
      }
    }
  }
  return NextResponse.json({});
};
