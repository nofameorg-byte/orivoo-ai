import "server-only";

export type CreateCustomerInput = {
  businessId: string;
  name: string;
  email: string;
};

export type CreateBusinessInput = {
  legalName: string;
  dbaName?: string;
  website?: string;
};

export type CreateAccountInput = {
  businessId: string;
  product: "business_checking" | "business_savings";
};

export type CreateTransferInput = {
  accountId: string;
  amountCents: number;
  destination: string;
};

export type MockBankingResult = {
  provider: "column" | "unit" | "treasury_prime";
  id: string;
  status: "mock_prepared";
  live: false;
  payload: Record<string, unknown>;
};

export interface FutureBankPartnerAdapter {
  createCustomer(input: CreateCustomerInput): Promise<MockBankingResult>;
  createBusiness(input: CreateBusinessInput): Promise<MockBankingResult>;
  createAccount(input: CreateAccountInput): Promise<MockBankingResult>;
  createTransfer(input: CreateTransferInput): Promise<MockBankingResult>;
}

function mockResult(
  provider: MockBankingResult["provider"],
  action: string,
  payload: Record<string, unknown>,
): MockBankingResult {
  return {
    provider,
    id: `${provider}_${action}_${crypto.randomUUID()}`,
    status: "mock_prepared",
    live: false,
    payload,
  };
}

abstract class MockAdapter implements FutureBankPartnerAdapter {
  protected abstract provider: MockBankingResult["provider"];

  async createCustomer(input: CreateCustomerInput) {
    return mockResult(this.provider, "customer", input);
  }

  async createBusiness(input: CreateBusinessInput) {
    return mockResult(this.provider, "business", input);
  }

  async createAccount(input: CreateAccountInput) {
    return mockResult(this.provider, "account", input);
  }

  async createTransfer(input: CreateTransferInput) {
    return mockResult(this.provider, "transfer", input);
  }
}

export class ColumnAdapter extends MockAdapter {
  protected provider = "column" as const;
}

export class UnitAdapter extends MockAdapter {
  protected provider = "unit" as const;
}

export class TreasuryPrimeAdapter extends MockAdapter {
  protected provider = "treasury_prime" as const;
}

export const futureBankPartnerAdapters = {
  column: new ColumnAdapter(),
  unit: new UnitAdapter(),
  treasuryPrime: new TreasuryPrimeAdapter(),
};
