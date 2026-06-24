import "server-only";

import {
  createIdempotencyKey,
  getColumnConnectionStatus,
} from "@/lib/column/client";
import type { Database } from "@/lib/database.types";

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

type KybApplication = Database["public"]["Tables"]["kyb_applications"]["Row"];
type BeneficialOwner = Database["public"]["Tables"]["beneficial_owners"]["Row"];

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

export function prepareColumnEntityPayload(application: KybApplication) {
  return {
    idempotencyKey: createIdempotencyKey("column_entity_prepare"),
    legalName: application.legal_business_name,
    dbaName: application.dba_name,
    ein: application.ein,
    formationState: application.formation_state,
    businessType: application.business_type,
    industry: application.industry,
    website: application.website,
    contactEmail: application.contact_email,
    phoneNumber: application.phone_number,
    businessAddress: application.business_address,
    mailingAddress: application.mailing_address,
    expectedMonthlyTransactionVolume:
      application.expected_monthly_transaction_volume,
    expectedAverageTransactionSize:
      application.expected_average_transaction_size,
    sourceOfFunds: application.source_of_funds,
    intendedUseOfAccount: application.intended_use_of_account,
    status: "prepared_for_partner_review",
    column: getColumnConnectionStatus(),
  };
}

export function prepareColumnBeneficialOwnersPayload(
  beneficialOwners: BeneficialOwner[],
) {
  return {
    idempotencyKey: createIdempotencyKey("column_owners_prepare"),
    owners: beneficialOwners.map((owner) => ({
      fullName: owner.full_name,
      title: owner.title,
      ownershipPercentage: owner.ownership_percentage,
      dateOfBirth: owner.date_of_birth,
      address: owner.address,
      ssnLast4Placeholder: owner.ssn_last4,
    })),
    status: "prepared_for_partner_review",
    column: getColumnConnectionStatus(),
  };
}

export function prepareColumnAccountPayload(application: KybApplication) {
  return {
    idempotencyKey: createIdempotencyKey("column_account_prepare"),
    businessName: application.legal_business_name,
    requestedProducts: ["business_checking"],
    requestedRails: ["ach"],
    applicationStatus: application.status,
    status: "prepared_not_submitted",
    column: getColumnConnectionStatus(),
  };
}

export async function submitToBankPartner(application: KybApplication) {
  // TODO: Submit only after approved KYB, sponsor-bank approval, signed program
  // agreement, webhook reconciliation, and production Column credentials.
  return {
    applicationId: application.id,
    legalBusinessName: application.legal_business_name,
    status: "partner_submission_placeholder",
    submitted: false,
    reason:
      "Banking services are subject to approval by regulated banking partners.",
    column: getColumnConnectionStatus(),
  };
}
