import { NextResponse } from "next/server";
import { createEntity } from "@/lib/column/service";
import {
  getAuthenticatedUserId,
  getStringField,
  readJson,
  safeErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/column/routes";

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const body = await readJson(request);
    const businessName = getStringField(body, "businessName", {
      min: 2,
      max: 120,
    });
    const entityType = getStringField(body, "entityType", { min: 2, max: 40 });
    const email = getStringField(body, "email", { email: true, max: 120 });

    for (const field of [businessName, entityType, email]) {
      if (field.error) {
        return validationErrorResponse(field.error);
      }
    }

    const entity = await createEntity({
      businessName: businessName.value,
      entityType: entityType.value,
      email: email.value,
    });

    return NextResponse.json({ userId, entity });
  } catch {
    return safeErrorResponse();
  }
}
