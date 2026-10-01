"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { GenLayerTransactionPanel, type SubmitInput, type TrackedStatus } from "@genlayer/transaction-kit-react";
import { useInvalidatePolicies } from "@/lib/hooks/useClaimLayer";
import { GENLAYER_NETWORK, getContractAddress } from "@/lib/genlayer/client";
import { useTransactionKit } from "@/lib/genlayer/kit";
import { useWallet } from "@/lib/genlayer/wallet";
import { error, success } from "@/lib/utils/toast";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const TEXTAREA_CLASS =
  "flex w-full min-h-[96px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function CreatePolicyModal() {
  const { isConnected, address, isLoading } = useWallet();
  const kit = useTransactionKit(address);
  const invalidate = useInvalidatePolicies();
  const contractAddress = getContractAddress();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "review">("form");
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [coverage, setCoverage] = useState("");
  const [errors, setErrors] = useState({ title: "", terms: "", evidenceUrl: "", coverage: "" });

  // Stable tx identity: the panel re-estimates whenever this object changes.
  const createPolicyTx = useMemo<SubmitInput>(
    () => ({
      kind: "write",
      address: contractAddress as `0x${string}`,
      method: "create_policy",
      args: [title.trim(), terms.trim(), evidenceUrl.trim(), Number(coverage)] as any,
    }),
    [contractAddress, title, terms, evidenceUrl, coverage],
  );

  useEffect(() => {
    if (!isConnected && isOpen && step === "form") {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, step]);

  const validateForm = (): boolean => {
    const next = { title: "", terms: "", evidenceUrl: "", coverage: "" };
    if (!title.trim()) next.title = "Give the policy a name";
    if (terms.trim().length < 10) next.terms = "Describe when a claim is valid (at least 10 characters)";
    if (!/^https?:\/\//i.test(evidenceUrl.trim())) next.evidenceUrl = "Enter a web address starting with http";
    const amount = Number(coverage);
    if (!Number.isInteger(amount) || amount <= 0) next.coverage = "Enter a whole number greater than 0";
    setErrors(next);
    return !Object.values(next).some((e) => e !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      error("Please connect your wallet first");
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
    if (!validateForm()) return;

    setStep("review");
  };

  const resetForm = () => {
    setTitle("");
    setTerms("");
    setEvidenceUrl("");
    setCoverage("");
    setStep("form");
    setErrors({ title: "", terms: "", evidenceUrl: "", coverage: "" });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm();
    setIsOpen(open);
  };

  const handleDone = (status: TrackedStatus) => {
    if (status.successful !== false) {
      invalidate();
      success("Policy created", {
        description: "Your policy is now recorded on GenLayer.",
      });
      resetForm();
      setIsOpen(false);
      return;
    }

    error("Failed to create policy", {
      description: "The transaction completed without a successful outcome.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" disabled={!isConnected || !address || isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="brand-card border-2 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create a Policy</DialogTitle>
          <DialogDescription>
            Write the terms in plain English and point to a public web page that will act as evidence.
          </DialogDescription>
        </DialogHeader>

        {step === "review" && kit && contractAddress ? (
          <div className="mt-4 space-y-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setStep("form")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <GenLayerTransactionPanel
              kit={kit}
              tx={createPolicyTx}
              network={GENLAYER_NETWORK.chainName}
              theme="dark"
              trackUntil="decided"
              onDone={handleDone}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Policy name</Label>
              <Input
                id="title"
                placeholder="Flight delay cover: LH400 on 12 Oct"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors({ ...errors, title: "" });
                }}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms (plain English)</Label>
              <textarea
                id="terms"
                placeholder="Pays out if flight LH400 is shown as delayed by more than 2 hours or cancelled."
                value={terms}
                onChange={(e) => {
                  setTerms(e.target.value);
                  setErrors({ ...errors, terms: "" });
                }}
                className={`${TEXTAREA_CLASS} ${errors.terms ? "border-destructive" : ""}`}
              />
              {errors.terms && <p className="text-xs text-destructive">{errors.terms}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceUrl">Evidence web page</Label>
              <Input
                id="evidenceUrl"
                type="url"
                placeholder="https://..."
                value={evidenceUrl}
                onChange={(e) => {
                  setEvidenceUrl(e.target.value);
                  setErrors({ ...errors, evidenceUrl: "" });
                }}
                className={errors.evidenceUrl ? "border-destructive" : ""}
              />
              {errors.evidenceUrl && <p className="text-xs text-destructive">{errors.evidenceUrl}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage amount</Label>
              <Input
                id="coverage"
                type="number"
                min={1}
                step={1}
                placeholder="100"
                value={coverage}
                onChange={(e) => {
                  setCoverage(e.target.value);
                  setErrors({ ...errors, coverage: "" });
                }}
                className={errors.coverage ? "border-destructive" : ""}
              />
              {errors.coverage && <p className="text-xs text-destructive">{errors.coverage}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={!kit}>
                Review
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
