import "server-only";

import {
  createIdempotencyKey,
  getColumnConnectionStatus,
} from "@/lib/column/client";

type CreateEntityInput = {
  businessName: string;
  entityType: string;
  email: string;
};

type CreateAccountInput = {
  entityId: string;
  name: string;
};

type SimulateTransferInput = {
  fromAccountId: string;
  destination: string;
  amountCents: number;
};

function getSandboxMetadata() {
  return {
    mode: "sandbox",
    column: getColumnConnectionStatus(),
  };
}

export async function createEntity(input: CreateEntityInput) {
  // TODO: Add production KYB/KYC, beneficial-owner collection, OFAC screening,
  // idempotency keys, request signing, and audit logging before live Column use.
  return {
    id: "col_entity_sandbox_vp23",
    idempotencyKey: createIdempotencyKey("entity"),
    businessName: input.businessName,
    entityType: input.entityType,
    email: input.email,
    status: "created_sandbox",
    ...getSandboxMetadata(),
  };
}

export async function createAccount(input: CreateAccountInput) {
  // TODO: Replace with Column account creation after compliance approval.
  return {
    id: "col_account_sandbox_operating",
    idempotencyKey: createIdempotencyKey("account"),
    entityId: input.entityId,
    name: input.name,
    routingNumber: "121145349",
    accountNumberMask: "2389",
    status: "open_sandbox",
    ...getSandboxMetadata(),
  };
}

export async function listAccounts(userId: string) {
  // TODO: Map authenticated Supabase users to verified Column entities.
  return {
    userId,
    accounts: [
      {
        id: "col_account_sandbox_operating",
        name: "VP23 Operating",
        balanceCents: 12843018,
        routingNumber: "121145349",
        accountNumberMask: "2389",
      },
      {
        id: "col_account_sandbox_reserve",
        name: "VP23 Tax Reserve",
        balanceCents: 3200000,
        routingNumber: "121145349",
        accountNumberMask: "7411",
      },
    ],
    ...getSandboxMetadata(),
  };
}

export async function listTransfers(userId: string) {
  // TODO: Verify Column webhooks and reconcile transfer status server-side.
  return {
    userId,
    transfers: [
      {
        id: "col_transfer_sandbox_9001",
        destination: "Tax Reserve",
        amountCents: 600000,
        status: "simulated",
      },
      {
        id: "col_transfer_sandbox_9000",
        destination: "Contractor payout",
        amountCents: 212520,
        status: "pending_sandbox",
      },
    ],
    ...getSandboxMetadata(),
  };
}

export async function simulateTransfer(input: SimulateTransferInput) {
  // TODO: Add production velocity limits, fraud checks, approvals, and
  // idempotent retries before enabling real funds movement.
  return {
    id: "col_transfer_sandbox_simulated",
    idempotencyKey: createIdempotencyKey("transfer"),
    fromAccountId: input.fromAccountId,
    destination: input.destination,
    amountCents: input.amountCents,
    status: "simulated",
    ...getSandboxMetadata(),
  };
}
