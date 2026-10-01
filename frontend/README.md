# ClaimLayer frontend

Next.js app for ClaimLayer. It reads the contract with `genlayer-js` and sends transactions through GenLayer Transaction Kit (`0.1.0-rc.2`) with MetaMask.

Environment variables (see `.env.example`):

- `NEXT_PUBLIC_CONTRACT_ADDRESS` – deployed ClaimLayer contract address
- `NEXT_PUBLIC_GENLAYER_RPC_URL`, `NEXT_PUBLIC_GENLAYER_CHAIN_ID`, `NEXT_PUBLIC_GENLAYER_CHAIN_NAME`, `NEXT_PUBLIC_GENLAYER_SYMBOL` – network (defaults to Studio Next, chain ID 61997)
