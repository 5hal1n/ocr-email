import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const ReceiptExtraction = z.object({
    merchant_name: z.string().describe("店舗名"),
    total_amount: z.number().describe("合計金額"),
});

const apiKey = "up_Y4sxIMWwlHx0WUyFRShbwcXEzxhVB";
const openai = new OpenAI({
    apiKey,
    baseURL: "https://api.upstage.ai/v1"
});

export const generateChatResponse = async (userMessage: string) => {
    const chatCompletion = await openai.responses.parse({
        model: "solar-pro2",
        input: [
            {
                "role": "user",
                "content": userMessage
            }
        ],
        stream: false,

        temperature: 0.7,
        text: {
            format: zodTextFormat(ReceiptExtraction, "receipt_extraction"),
        },
        max_output_tokens: 16384,
    });
    return chatCompletion.output_parsed;
}
