import { setGlobalOptions } from "firebase-functions/v2";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { receiveEmailHandler } from "./handlers/receiveEmail";

// Initialize Firebase Admin SDK
initializeApp();

// Set global options for all functions
setGlobalOptions({
  region: "asia-northeast1",
  maxInstances: 10,
});

// Email receiving webhook function
export const receiveEmail = onRequest(
  {
    memory: "512MiB",
    timeoutSeconds: 540,
    secrets: ["RESEND_API_KEY", "UPSTAGE_API_KEY"],
  },
  async (request, response) => {
    // Set CORS headers if needed
    response.set("Access-Control-Allow-Origin", "*");

    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      await receiveEmailHandler(request.body);
      response.status(200).json({ success: true });
    } catch (error) {
      logger.error("Email processing failed", error);
      response.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
