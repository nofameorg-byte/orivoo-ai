import { NextResponse } from "next/server";
import { listTransfers } from "@/lib/column/service";
import {
  getAuthenticatedUserId,
  unauthorizedResponse,
} from "@/lib/column/routes";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const payload = await listTransfers(userId);

  return NextResponse.json(payload);
}
