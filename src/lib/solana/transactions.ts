import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionConfirmationStrategy,
  Commitment,
} from '@solana/web3.js';
import { createConnection, getExplorerUrl } from './config';

// Transaction status types
export type TransactionStatus = 'pending' | 'confirming' | 'confirmed' | 'failed';

export interface TransactionResult {
  signature: string;
  status: TransactionStatus;
  error?: string;
  explorerUrl: string;
}

// Deserialize transaction from base64
export function deserializeTransaction(serialized: string): Transaction {
  const buffer = Buffer.from(serialized, 'base64');
  return Transaction.from(buffer);
}

// Serialize transaction to base64
export function serializeTransaction(transaction: Transaction): string {
  return transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  }).toString('base64');
}

// Wait for transaction confirmation
export async function confirmTransaction(
  signature: string,
  commitment: Commitment = 'confirmed',
  timeoutMs: number = 60000
): Promise<{ confirmed: boolean; error?: string }> {
  const connection = createConnection();

  try {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    const strategy: TransactionConfirmationStrategy = {
      signature,
      blockhash,
      lastValidBlockHeight,
    };

    const result = await connection.confirmTransaction(strategy, commitment);

    if (result.value.err) {
      return { confirmed: false, error: JSON.stringify(result.value.err) };
    }

    return { confirmed: true };
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return { confirmed: false, error: 'Confirmation timeout' };
  }
}

// Get transaction details
export async function getTransactionDetails(signature: string): Promise<{
  success: boolean;
  slot?: number;
  blockTime?: number;
  fee?: number;
  error?: string;
}> {
  const connection = createConnection();

  try {
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { success: false, error: 'Transaction not found' };
    }

    return {
      success: !tx.meta?.err,
      slot: tx.slot,
      blockTime: tx.blockTime || undefined,
      fee: tx.meta?.fee,
      error: tx.meta?.err ? JSON.stringify(tx.meta.err) : undefined,
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch transaction' };
  }
}

// Check if signature is valid format
export function isValidSignature(signature: string): boolean {
  // Solana signatures are base58 encoded and typically 87-88 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
  return base58Regex.test(signature);
}

// Poll for transaction status (useful for client-side)
export async function pollTransactionStatus(
  signature: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000,
  onStatusChange?: (status: TransactionStatus) => void
): Promise<TransactionResult> {
  const explorerUrl = getExplorerUrl(signature);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const details = await getTransactionDetails(signature);

      if (details.success) {
        onStatusChange?.('confirmed');
        return {
          signature,
          status: 'confirmed',
          explorerUrl,
        };
      }

      if (details.error && details.error !== 'Transaction not found') {
        onStatusChange?.('failed');
        return {
          signature,
          status: 'failed',
          error: details.error,
          explorerUrl,
        };
      }

      onStatusChange?.('confirming');
    } catch {
      // Continue polling
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return {
    signature,
    status: 'failed',
    error: 'Transaction confirmation timeout',
    explorerUrl,
  };
}

// Simulate transaction before sending
export async function simulateTransaction(
  transaction: Transaction
): Promise<{ success: boolean; error?: string; logs?: string[] }> {
  const connection = createConnection();

  try {
    const result = await connection.simulateTransaction(transaction);

    if (result.value.err) {
      return {
        success: false,
        error: JSON.stringify(result.value.err),
        logs: result.value.logs || undefined,
      };
    }

    return {
      success: true,
      logs: result.value.logs || undefined,
    };
  } catch (error) {
    return { success: false, error: 'Simulation failed' };
  }
}

// Get recent prioritization fees (for faster transactions)
export async function getRecentPrioritizationFees(): Promise<number> {
  const connection = createConnection();

  try {
    const fees = await connection.getRecentPrioritizationFees();
    if (fees.length === 0) return 0;

    // Get median fee
    const sortedFees = fees
      .map(f => f.prioritizationFee)
      .sort((a, b) => a - b);

    return sortedFees[Math.floor(sortedFees.length / 2)];
  } catch {
    return 0;
  }
}

// Format transaction for display
export function formatTransactionForDisplay(tx: {
  signature: string;
  status: TransactionStatus;
  amount?: number;
  type?: string;
}): {
  shortSignature: string;
  statusEmoji: string;
  statusText: string;
  explorerUrl: string;
} {
  const shortSignature = `${tx.signature.slice(0, 8)}...${tx.signature.slice(-8)}`;

  const statusMap: Record<TransactionStatus, { emoji: string; text: string }> = {
    pending: { emoji: '🔄', text: 'Pending' },
    confirming: { emoji: '⏳', text: 'Confirming' },
    confirmed: { emoji: '✅', text: 'Confirmed' },
    failed: { emoji: '❌', text: 'Failed' },
  };

  const { emoji, text } = statusMap[tx.status];

  return {
    shortSignature,
    statusEmoji: emoji,
    statusText: text,
    explorerUrl: getExplorerUrl(tx.signature),
  };
}
