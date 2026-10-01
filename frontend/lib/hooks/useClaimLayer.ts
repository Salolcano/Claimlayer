"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import ClaimLayer from "../contracts/ClaimLayer";
import { getContractAddress } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import type { Policy } from "../contracts/types";

/**
 * Returns the ClaimLayer contract instance, or null if
 * NEXT_PUBLIC_CONTRACT_ADDRESS is not set. Read calls work without a wallet.
 */
export function useClaimLayerContract(): ClaimLayer | null {
  const { address } = useWallet();
  const contractAddress = getContractAddress();

  return useMemo(() => {
    if (!contractAddress) {
      return null;
    }
    return new ClaimLayer(contractAddress, address);
  }, [contractAddress, address]);
}

export function usePolicies() {
  const contract = useClaimLayerContract();

  return useQuery<Policy[], Error>({
    queryKey: ["policies"],
    queryFn: () => (contract ? contract.getPolicies() : Promise.resolve([])),
    refetchOnWindowFocus: true,
    staleTime: 2000,
    enabled: !!contract,
  });
}

export function usePayout(address: string | null) {
  const contract = useClaimLayerContract();

  return useQuery<number, Error>({
    queryKey: ["payout", address],
    queryFn: () => (contract ? contract.getPayout(address) : Promise.resolve(0)),
    refetchOnWindowFocus: true,
    enabled: !!address && !!contract,
    staleTime: 2000,
  });
}

export function useInvalidatePolicies() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["policies"] });
    queryClient.invalidateQueries({ queryKey: ["payout"] });
  }, [queryClient]);
}
