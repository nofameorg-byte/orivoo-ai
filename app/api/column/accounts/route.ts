import { NextResponse } from "next/server";
import { createAccount, listAccounts } from "@/lib/column/service";
import {
  getAuthenticatedUserId,
  getStringField,
  readJson,
  safeErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/column/routes";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const payload = await listAccounts(userId);

    return NextResponse.json(payload);
  } catch {
    return safeErrorResponse();
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await readJson(request);
    const entityId = getStringField(body, "entityId", { min: 6, max: 120 });
    const name = getStringField(body, "name", { min: 2, max: 80 });

    for (const field of [entityId, name]) {
      if (field.error) {
        return validationErrorResponse(field.error);
      }
    }

    const account = await createAccount({
      entityId: entityId.value,
      name: name.value,
    });

    return NextResponse.json({ userId, account });
  } catch {
    return safeErrorResponse();
  }
}
