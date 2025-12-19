import { type NextRequest, NextResponse } from "next/server";

/**
 * @deprecated This endpoint has been migrated to Firebase Cloud Functions.
 * Please update your webhook URL to the new Cloud Function endpoint.
 */
export const POST = async (request: NextRequest) => {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated and has been migrated to Firebase Cloud Functions.",
      message: "Please update your Resend webhook URL to the new Cloud Function endpoint.",
      documentation: "See CLAUDE.md for deployment instructions.",
    },
    { status: 410 } // 410 Gone
  );
};
