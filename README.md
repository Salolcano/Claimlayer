# ClaimLayer

Plain-English parametric insurance on GenLayer.

A user creates a policy by writing the terms in normal language and pointing to a public web page that acts as evidence (a flight status page, a weather report, an outage tracker). When something goes wrong, the holder files a claim. The Intelligent Contract reads the evidence page live, and GenLayer validators use LLM consensus to decide whether the terms were met. Approved claims are credited on-chain; unclear evidence is rejected.

GenLayer is the core of the workflow: a normal smart contract cannot fetch live web pages or judge whether plain-English terms were satisfied.

## Network

- Network: Studio Next (Consensus v0.6)
- RPC: https://studio-next.genlayer.com/api
- Chain ID: 61997
- Explorer: https://explorer-studio-dev.genlayer.com/
- Deployed contract: *(set after redeploying `contracts/claim_layer.py` on Studio Next)*

## Project structure

```
contracts/claim_layer.py   # ClaimLayer Intelligent Contract
frontend/                  # Next.js app (Transaction Kit RC2, genlayer-js 2.0.0-rc.1)
deploy/deployScript.ts     # Deployment script used by `genlayer deploy`
```

## Contract

`contracts/claim_layer.py`

| Method | Type | What it does |
| --- | --- | --- |
| `create_policy(title, terms, evidence_url, coverage)` | write | Creates a policy for the caller |
| `file_claim(policy_id, claim_text)` | write | Fetches the evidence page and lets validators judge the claim |
| `get_policy(policy_id)` | view | One policy as JSON |
| `get_policies()` | view | All policies as JSON |
| `get_policy_count()` | view | Number of policies |
| `get_payout_of(address)` | view | Total coverage credited to an address |

A policy is `active`, then ends as `paid` or `denied`. Each policy gets one final decision, and only its holder can file the claim.

## How the decision works

`file_claim` reads the evidence page with `gl.nondet.web.render` and asks the model for `{"approved": bool, "evidence_quote": str}`. The decision is reduced to one value (`approved`, `denied`, `unavailable` or `invalid`) and `gl.eq_principle.strict_eq` makes validators agree on exactly that value before any state changes.

Claim integrity rules:

- **Fail-safe approval.** Only a real JSON boolean `true` can approve. Strings such as `"true"` or `"false"`, numbers, missing fields and malformed output never approve.
- **Evidence-bound approval.** An approval must quote text that is actually present in the fetched page; the contract checks this itself.
- **Unavailable evidence or unusable output** reverts the claim with no state change, so the policy stays active and can be retried.
- **Prompt isolation.** Policy terms, claim text and page content are untrusted. They are sent as one JSON-escaped data object, with the rules placed before and after it.
- **Consensus-bound explanation.** The stored `outcome` and `verdict_reason` are written by the contract from the agreed decision. Free-form model text is never stored.
- **One-shot finalization.** A policy is decided once (`paid` or `denied`) and cannot be claimed again.

Known limitation: the policy holder chooses both the terms and the evidence page, so this is a demo of consensus adjudication, not a production insurer. A real deployment would need trusted evidence sources.

## Tests

```
pip install -r requirements.txt
pytest tests/direct/ -v
```

`tests/direct/test_claim_layer.py` covers string and malformed model output, render failure, approval, denial, one-shot finalization, access rules and adversarial evidence pages.

## Frontend

The frontend reads the contract with `genlayer-js` and sends every write (`create_policy`, `file_claim`) through the Transaction Kit panel, which shows the fee quote and tracks the transaction until validators decide.

1. Copy `frontend/.env.example` to `frontend/.env`
2. Set `NEXT_PUBLIC_CONTRACT_ADDRESS` to your deployed contract address
3. Install and run:

```
npm ci
npm run dev
```

You need MetaMask. The app adds and switches to the Studio Next network (chain ID 61997) for you.
