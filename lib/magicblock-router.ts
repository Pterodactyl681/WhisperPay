import { Transaction } from "@solana/web3.js";

interface MagicRouterBlockhashResult {
  blockhash: string;
  lastValidBlockHeight: number;
}

const isValidBlockhashResult = (value: unknown): value is MagicRouterBlockhashResult => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.blockhash === "string" && typeof candidate.lastValidBlockHeight === "number";
};

export const getWritableAccounts = (transaction: Transaction): string[] => {
  const writable = new Set<string>();

  if (transaction.feePayer) {
    writable.add(transaction.feePayer.toBase58());
  }

  for (const instruction of transaction.instructions) {
    for (const key of instruction.keys) {
      if (key.isWritable) {
        writable.add(key.pubkey.toBase58());
      }
    }
  }

  return Array.from(writable);
};

export const getMagicRouterBlockhashForTransaction = async (
  routerRpcUrl: string,
  transaction: Transaction
): Promise<MagicRouterBlockhashResult | null> => {
  const writableAccounts = getWritableAccounts(transaction);

  if (!routerRpcUrl || writableAccounts.length === 0) {
    return null;
  }

  try {
    const response = await fetch(routerRpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBlockhashForAccounts",
        params: [writableAccounts]
      })
    });

    const payload = (await response.json()) as { result?: unknown };
    return isValidBlockhashResult(payload.result) ? payload.result : null;
  } catch {
    return null;
  }
};
