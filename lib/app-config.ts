import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

const MAGICBLOCK_DEVNET_ROUTER_HTTPS = "https://devnet-router.magicblock.app";

const resolveNetwork = (): WalletAdapterNetwork => {
  const raw = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet").toLowerCase();

  if (raw === "mainnet" || raw === "mainnet-beta") {
    return WalletAdapterNetwork.Mainnet;
  }

  if (raw === "testnet") {
    return WalletAdapterNetwork.Testnet;
  }

  return WalletAdapterNetwork.Devnet;
};

const network = resolveNetwork();
const defaultRpcUrl = network === WalletAdapterNetwork.Devnet ? MAGICBLOCK_DEVNET_ROUTER_HTTPS : "";

export const appConfig = {
  solana: {
    network,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? defaultRpcUrl,
    explorerBaseUrl: process.env.NEXT_PUBLIC_SOLANA_EXPLORER_BASE_URL ?? "https://explorer.solana.com"
  },
  site: {
    name: "WhisperPay",
    description: "Private crypto payments with private notes",
    links: {
      twitterX: "https://x.com/Nurarihyasa",
      github: "https://github.com/Pterodactyl681",
      docs: "https://github.com/Pterodactyl681/whisperpay#readme"
    }
  }
} as const;

export const getExplorerTxUrl = (signature: string): string => {
  const base = appConfig.solana.explorerBaseUrl.replace(/\/$/, "");

  if (appConfig.solana.network === WalletAdapterNetwork.Mainnet || base.includes("cluster=")) {
    return `${base}/tx/${signature}`;
  }

  return `${base}/tx/${signature}?cluster=${appConfig.solana.network}`;
};
