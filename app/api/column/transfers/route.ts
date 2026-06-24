import { NextResponse } from "next/server";
import { listTransfers } from "@/lib/column/service";
import {
  getAuthenticatedUserId,
  safeErrorResponse,
  unauthorizedResponse,
} from "@/lib/column/routes";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const payload = await listTransfers(userId);

    return NextResponse.json(payload);
  } catch {
    return safeErrorResponse();
  }
}
