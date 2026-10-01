import { createClient } from "genlayer-js";
import { GENLAYER_CHAIN } from "../genlayer/client";
import type { Policy } from "./types";

/**
 * ClaimLayer contract class: read-only calls to the deployed Intelligent Contract.
 * Writes go through Transaction Kit (see the modals in /components).
 */
class ClaimLayer {
  private contractAddress: `0x${string}`;
  private client: any;

  constructor(contractAddress: string, address?: string | null) {
    this.contractAddress = contractAddress as `0x${string}`;

    const config: any = {
      chain: GENLAYER_CHAIN,
    };

    if (address) {
      config.account = address as `0x${string}`;
    }

    this.client = createClient(config);
  }

  /**
   * Update the address used for calls
   */
  updateAccount(address: string): void {
    const config: any = {
      chain: GENLAYER_CHAIN,
      account: address as `0x${string}`,
    };

    this.client = createClient(config);
  }

  /**
   * Get all policies (newest first)
   */
  async getPolicies(): Promise<Policy[]> {
    try {
      const raw: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_policies",
        args: [],
      });

      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!Array.isArray(parsed)) {
        return [];
      }

      return (parsed as Policy[])
        .map((p) => ({
          ...p,
          coverage: Number(p.coverage),
          premium: Number(p.premium),
        }))
        .sort((a, b) => Number(b.id) - Number(a.id));
    } catch (error) {
      console.error("Error fetching policies:", error);
      throw new Error("Failed to fetch policies from contract");
    }
  }

  /**
   * Total coverage credited to an address after approved claims
   */
  async getPayout(address: string | null): Promise<number> {
    if (!address) {
      return 0;
    }

    try {
      const payout = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_payout_of",
        args: [address],
      });

      return Number(payout) || 0;
    } catch (error) {
      console.error("Error fetching payout:", error);
      return 0;
    }
  }
}

export default ClaimLayer;
