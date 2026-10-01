"use client";

import { useMemo, useState } from "react";
import { Loader2, ShieldCheck, ShieldX, Shield, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { GenLayerTransactionPanel, type SubmitInput, type TrackedStatus } from "@genlayer/transaction-kit-react";
import { useClaimLayerContract, useInvalidatePolicies, usePolicies } from "@/lib/hooks/useClaimLayer";
import { GENLAYER_NETWORK, getContractAddress } from "@/lib/genlayer/client";
import { useTransactionKit } from "@/lib/genlayer/kit";
import { useWallet } from "@/lib/genlayer/wallet";
import { error, success } from "@/lib/utils/toast";
import { AddressDisplay } from "./AddressDisplay";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import type { Policy } from "@/lib/contracts/types";

const TEXTAREA_CLASS =
  "flex w-full min-h-[96px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function PoliciesTable() {
  const contract = useClaimLayerContract();
  const { data: policies, isLoading, isError } = usePolicies();
  const { address, isConnected, isLoading: isWalletLoading } = useWallet();
  const kit = useTransactionKit(address);
  const invalidate = useInvalidatePolicies();
  const contractAddress = getContractAddress();

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimText, setClaimText] = useState("");
  const [step, setStep] = useState<"form" | "review">("form");
  const [claimError, setClaimError] = useState("");

  // Stable tx identity: the panel re-estimates whenever this object changes.
  const claimTx = useMemo<SubmitInput | null>(
    () =>
      claimingId
        ? {
            kind: "write",
            address: contractAddress as `0x${string}`,
            method: "file_claim",
            args: [claimingId, claimText.trim()],
          }
        : null,
    [contractAddress, claimingId, claimText],
  );

  const closeClaim = () => {
    setClaimingId(null);
    setClaimText("");
    setStep("form");
    setClaimError("");
  };

  const openClaim = (id: string) => {
    if (!address) {
      error("Please connect your wallet to file a claim");
      return;
    }
    if (!kit) {
      error("Transaction kit unavailable", {
        description: "Please check your wallet connection and try again.",
      });
      return;
    }
    if (!contractAddress) {
      error("Contract address not configured", {
        description: "Please set NEXT_PUBLIC_CONTRACT_ADDRESS.",
      });
      return;
    }
    setClaimingId(id);
  };

  const reviewClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (claimText.trim().length < 5) {
      setClaimError("Briefly describe what happened");
      return;
    }
    setClaimError("");
    setStep("review");
  };

  const handleClaimDone = (status: TrackedStatus) => {
    if (status.successful !== false) {
      invalidate();
      success("Claim decided", {
        description: "Validators reached consensus. Check the policy for the verdict.",
      });
      closeClaim();
      return;
    }

    error("Claim transaction failed", {
      description: "The transaction completed without a successful outcome.",
    });
  };

  if (isLoading) {
    return (
      <div className="brand-card p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-yellow-400 opacity-60" />
          <h3 className="text-xl font-bold">Setup Required</h3>
          <p className="text-sm text-muted-foreground">
            Set <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_CONTRACT_ADDRESS</code> to your deployed contract address.
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="brand-card p-8">
        <p className="text-center text-destructive">Failed to load policies. Please try again.</p>
      </div>
    );
  }

  if (!policies || policies.length === 0) {
    return (
      <div className="brand-card p-12">
        <div className="text-center space-y-3">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
          <h3 className="text-xl font-bold">No Policies Yet</h3>
          <p className="text-muted-foreground">Create the first policy to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            currentAddress={address}
            canAct={isConnected && !isWalletLoading}
            onClaim={openClaim}
          />
        ))}
      </div>

      <Dialog open={!!claimingId} onOpenChange={(open) => !open && closeClaim()}>
        <DialogContent className="brand-card border-2 sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">File a Claim</DialogTitle>
            <DialogDescription>
              Validators will read the evidence page and decide whether your policy terms were met.
            </DialogDescription>
          </DialogHeader>

          {step === "review" && kit && contractAddress && claimTx ? (
            <div className="mt-4 space-y-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => setStep("form")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <GenLayerTransactionPanel
                kit={kit}
                tx={claimTx}
                network={GENLAYER_NETWORK.chainName}
                theme="dark"
                trackUntil="decided"
                onDone={handleClaimDone}
              />
            </div>
          ) : (
            <form onSubmit={reviewClaim} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="claimText">What happened?</Label>
                <textarea
                  id="claimText"
                  placeholder="My flight was delayed by 3 hours, see the status page."
                  value={claimText}
                  onChange={(e) => {
                    setClaimText(e.target.value);
                    setClaimError("");
                  }}
                  className={`${TEXTAREA_CLASS} ${claimError ? "border-destructive" : ""}`}
                />
                {claimError && <p className="text-xs text-destructive">{claimError}</p>}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={closeClaim}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" className="flex-1">
                  Review
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface PolicyCardProps {
  policy: Policy;
  currentAddress: string | null;
  canAct: boolean;
  onClaim: (id: string) => void;
}

function StatusBadge({ status }: { status: Policy["status"] }) {
  if (status === "paid") {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <ShieldCheck className="w-3 h-3 mr-1" />
        Paid
      </Badge>
    );
  }
  if (status === "denied") {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        <ShieldX className="w-3 h-3 mr-1" />
        Denied
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
      <Shield className="w-3 h-3 mr-1" />
      Active
    </Badge>
  );
}

function PolicyCard({ policy, currentAddress, canAct, onClaim }: PolicyCardProps) {
  const isHolder = currentAddress?.toLowerCase() === policy.holder?.toLowerCase();
  const canClaim = canAct && isHolder && policy.status === "active";

  return (
    <div className="brand-card p-5 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="text-lg font-bold break-words">{policy.title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AddressDisplay address={policy.holder} maxLength={10} showCopy={true} />
            {isHolder && (
              <Badge variant="secondary" className="text-xs">
                You
              </Badge>
            )}
          </div>
        </div>
        <StatusBadge status={policy.status} />
      </div>

      <p className="text-sm text-muted-foreground break-words">{policy.terms}</p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
        <span>
          Coverage: <span className="font-semibold text-accent">{policy.coverage}</span>
        </span>
        <span>
          Premium: <span className="font-semibold">{policy.premium}</span>
        </span>
        <a
          href={policy.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          Evidence page
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {policy.verdict_reason && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Validator verdict</div>
          <p className="break-words">{policy.verdict_reason}</p>
        </div>
      )}

      {canClaim && (
        <Button size="sm" variant="gradient" onClick={() => onClaim(policy.id)}>
          File a claim
        </Button>
      )}
    </div>
  );
}
