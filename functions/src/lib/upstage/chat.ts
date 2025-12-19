import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const ReceiptExtraction = z.object({
  merchant_name: z.string().describe("店舗名"),
  total_amount: z.number().describe("合計金額"),
});

export const generateChatResponse = async (
  userMessage: string,
  apiKey: string,
) => {
  const openai = new OpenAI({
    apiKey,
    baseURL: "https://api.upstage.ai/v1",
  });

  const chatCompletion = await openai.chat.completions.create({
    model: "solar-pro2",
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
    stream: false,
    temperature: 0.7,
    reasoning_effort: "high",
    max_tokens: 16384,
    response_format: zodResponseFormat(ReceiptExtraction, "receipt_extraction"),
  });

  const res = chatCompletion.choices[0].message;
  if (res.refusal) {
    console.warn("Model refused to answer:", res.content);
    return null;
  }
  if (!res.content) {
    console.warn("No content in the response");
    return null;
  }
  return JSON.parse(res.content) as z.infer<typeof ReceiptExtraction>;
};
