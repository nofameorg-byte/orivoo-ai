import { NextResponse } from "next/server";
import { simulateTransfer } from "@/lib/column/service";
import {
  getAmountCentsField,
  getAuthenticatedUserId,
  getStringField,
  readJson,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/column/routes";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const body = await readJson(request);
  const fromAccountId = getStringField(body, "fromAccountId", {
    min: 6,
    max: 120,
  });
  const destination = getStringField(body, "destination", { min: 2, max: 120 });
  const amountCents = getAmountCentsField(body, "amount");

  for (const field of [fromAccountId, destination, amountCents]) {
    if (field.error) {
      return validationErrorResponse(field.error);
    }
  }

  const transfer = await simulateTransfer({
    fromAccountId: fromAccountId.value,
    destination: destination.value,
    amountCents: amountCents.value,
  });

  return NextResponse.json({ userId, transfer });
}
