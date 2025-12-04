import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { parseDocument } from "@/lib/upstage";
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
    type: 'email.received'; // リテラル型を使用（他のイベントと判別しやすくするため）
    created_at: string;
    data: EmailData;
}

const resend = new Resend("re_Z8joLx9W_KTiTHiEdVjQi17DqCa12j7Fn")

export const POST = async (request: NextRequest) => {
    const receivedData: EmailReceivedEvent = await request.json();
    if (receivedData.type === 'email.received') {
        const { data: attachments } = await resend
            .emails
            .receiving
            .attachments
            .list({ emailId: receivedData.data.email_id });
        if (attachments !== null) {
            for (const attachment of attachments.data) {
                // use the download_url to download attachments however you want
                const response = await fetch(attachment.download_url);
                if (!response.ok) {
                    console.error(`Failed to download ${attachment.filename}`);
                    continue;
                }

                // get the file's contents
                const buffer = Buffer.from(await response.arrayBuffer());
                const res = await parseDocument(new Blob([buffer]))
                console.info(res)
                // process the content (e.g., save to storage, analyze, etc.)
            }
        }

    }
    return NextResponse.json({});
}