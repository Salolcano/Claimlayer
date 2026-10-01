"use client";

import { Wallet } from "lucide-react";
import { useWallet } from "@/lib/genlayer/wallet";
import { usePayout } from "@/lib/hooks/useClaimLayer";

export function PayoutCard() {
  const { address, isConnected } = useWallet();
  const { data: payout = 0 } = usePayout(address);

  return (
    <div className="brand-card p-6 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Wallet className="w-5 h-5 text-accent" />
        Your Payouts
      </h2>
      {isConnected ? (
        <div>
          <p className="text-4xl font-bold text-accent">{payout}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total coverage credited to your wallet after approved claims.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Connect your wallet to see your payouts.</p>
      )}
    </div>
  );
}
