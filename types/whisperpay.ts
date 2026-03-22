export type TokenSymbol = "SOL" | "USDC";
export type PublicPaymentStatus = "pending" | "sent" | "failed";

export interface WalletState {
  connected: boolean;
  address: string | null;
  label: string | null;
}

export interface Paylink {
  id: string;
  ownerWallet: string;
  nickname: string;
  defaultToken: TokenSymbol;
  createdAt: string;
  isActive: boolean;
}

export interface PublicPayment {
  id: string;
  paylinkId: string;
  fromWallet: string;
  toWallet: string;
  status: PublicPaymentStatus;
  createdAt: string;
  txSignature: string | null;
}

export interface PrivatePaymentDetails {
  paymentId: string;
  amount: number;
  note: string;
  canRevealWallets: string[];
}
