/**
 * TypeScript types for the ClaimLayer contract
 */

export type PolicyStatus = "active" | "paid" | "denied";

export interface Policy {
  id: string;
  holder: string;
  title: string;
  terms: string;
  evidence_url: string;
  coverage: number;
  premium: number;
  status: PolicyStatus;
  outcome: "" | "terms_met" | "terms_not_met";
  claim_text: string;
  verdict_reason: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}
