"use client";

import { Navbar } from "@/components/Navbar";
import { PoliciesTable } from "@/components/PoliciesTable";
import { PayoutCard } from "@/components/PayoutCard";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Padding accounts for the fixed navbar */}
      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">ClaimLayer</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Plain-English insurance, decided by GenLayer validators.
              <br />
              Write the terms, point to the evidence, and let consensus settle the claim.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 animate-slide-up">
              <PoliciesTable />
            </div>
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
              <PayoutCard />
            </div>
          </div>

          <div className="mt-8 glass-card p-6 md:p-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-2xl font-bold mb-4">How it Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">1. Create a Policy</div>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet and describe what is covered in plain English. Link a public web page that will act as evidence, such as a flight status or weather report.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">2. File a Claim</div>
                <p className="text-sm text-muted-foreground">
                  When something goes wrong, the policy holder files a claim. The Intelligent Contract fetches the evidence page live from the web.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-accent font-bold text-lg">3. Validators Decide</div>
                <p className="text-sm text-muted-foreground">
                  Validators use LLM consensus to judge whether the terms were met. Approved claims are credited to the holder; unclear evidence is rejected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Powered by GenLayer
            </a>
            <a href="https://studio-next.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Studio
            </a>
            <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
