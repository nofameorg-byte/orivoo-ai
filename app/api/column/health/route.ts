import { NextResponse } from "next/server";
import { getColumnConnectionStatus } from "@/lib/column/client";
import {
  getAuthenticatedUserId,
  unauthorizedResponse,
} from "@/lib/column/routes";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  return NextResponse.json({
    userId,
    column: getColumnConnectionStatus(),
    requiredBeforeProduction: [
      "Column production approval",
      "Sponsor-bank program agreement",
      "KYB/KYC verification flow",
      "Signed webhooks and reconciliation",
    ],
  });
}
