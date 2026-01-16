import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import bs58 from 'bs58';
import {
  createConnection,
  TREASURY_PUBLIC_KEY,
  solToLamports,
  lamportsToSol,
  isTreasuryConfigured,
  PLATFORM_FEE_PERCENT,
} from './config';

// Get treasury keypair (server-side only)
function getTreasuryKeypair(): Keypair | null {
  const privateKey = process.env.TREASURY_PRIVATE_KEY;
  if (!privateKey) return null;

  try {
    const decoded = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decoded);
  } catch {
    console.error('Invalid treasury private key');
    return null;
  }
}

// Create a transfer instruction from user to treasury
export function createTransferToTreasuryInstruction(
  userPubkey: PublicKey,
  amountSol: number
): TransactionInstruction | null {
  if (!TREASURY_PUBLIC_KEY) {
    console.error('Treasury public key not configured');
    return null;
  }

  const lamports = solToLamports(amountSol);

  return SystemProgram.transfer({
    fromPubkey: userPubkey,
    toPubkey: TREASURY_PUBLIC_KEY,
    lamports,
  });
}

// Create an unsigned transaction for user to sign
export async function createBetTransaction(
  userPubkey: PublicKey,
  amountSol: number,
  betId: string,
  side: 'yes' | 'no'
): Promise<{ transaction: Transaction; serialized: string } | null> {
  if (!isTreasuryConfigured()) {
    console.error('Treasury not configured');
    return null;
  }

  const connection = createConnection();

  // Create transfer instruction
  const transferIx = createTransferToTreasuryInstruction(userPubkey, amountSol);
  if (!transferIx) return null;

  // Create memo instruction for tracking (optional, helps with on-chain audit trail)
  const memo = `pumpbet:${betId}:${side}:${amountSol}`;
  const memoIx = new TransactionInstruction({
    keys: [],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    data: Buffer.from(memo),
  });

  // Build transaction
  const transaction = new Transaction();
  transaction.add(transferIx);
  transaction.add(memoIx);

  // Get recent blockhash
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = userPubkey;

  // Serialize for client-side signing
  const serialized = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  }).toString('base64');

  return { transaction, serialized };
}

// Verify a transaction on-chain
export async function verifyTransaction(
  signature: string,
  expectedAmount: number,
  expectedSender?: string
): Promise<{
  success: boolean;
  amount?: number;
  sender?: string;
  receiver?: string;
  error?: string;
}> {
  const connection = createConnection();

  try {
    // Get transaction details
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { success: false, error: 'Transaction not found' };
    }

    if (tx.meta?.err) {
      return { success: false, error: 'Transaction failed on-chain' };
    }

    // Check confirmations
    const slot = await connection.getSlot();
    const confirmations = slot - (tx.slot || 0);
    if (confirmations < 1) {
      return { success: false, error: 'Transaction not confirmed' };
    }

    // Parse transfer instruction
    const instructions = tx.transaction.message.instructions;
    for (const ix of instructions) {
      if ('parsed' in ix && ix.parsed?.type === 'transfer') {
        const info = ix.parsed.info;
        const amount = lamportsToSol(info.lamports);
        const sender = info.source;
        const receiver = info.destination;

        // Verify receiver is treasury
        if (TREASURY_PUBLIC_KEY && receiver !== TREASURY_PUBLIC_KEY.toString()) {
          continue; // Not a transfer to treasury
        }

        // Verify amount (with small tolerance for fees)
        if (Math.abs(amount - expectedAmount) > 0.0001) {
          return { success: false, error: `Amount mismatch: expected ${expectedAmount}, got ${amount}` };
        }

        // Verify sender if provided
        if (expectedSender && sender !== expectedSender) {
          return { success: false, error: 'Sender mismatch' };
        }

        return { success: true, amount, sender, receiver };
      }
    }

    return { success: false, error: 'No transfer instruction found' };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { success: false, error: 'Failed to verify transaction' };
  }
}

// Get treasury balance
export async function getTreasuryBalance(): Promise<number> {
  if (!TREASURY_PUBLIC_KEY) return 0;

  const connection = createConnection();
  try {
    const balance = await connection.getBalance(TREASURY_PUBLIC_KEY);
    return lamportsToSol(balance);
  } catch {
    return 0;
  }
}

// Send SOL from treasury to winner (server-side only)
export async function sendPayout(
  recipientAddress: string,
  amountSol: number
): Promise<{ success: boolean; signature?: string; error?: string }> {
  const keypair = getTreasuryKeypair();
  if (!keypair) {
    return { success: false, error: 'Treasury keypair not configured' };
  }

  const connection = createConnection();

  try {
    const recipientPubkey = new PublicKey(recipientAddress);
    const lamports = solToLamports(amountSol);

    // Check treasury balance
    const balance = await connection.getBalance(keypair.publicKey);
    if (balance < lamports + 5000) { // 5000 lamports for tx fee
      return { success: false, error: 'Insufficient treasury balance' };
    }

    // Create and send transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: recipientPubkey,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

    return { success: true, signature };
  } catch (error) {
    console.error('Error sending payout:', error);
    return { success: false, error: 'Failed to send payout' };
  }
}

// Calculate payout amount after platform fee
export function calculatePayoutAfterFee(grossAmount: number): number {
  const fee = grossAmount * (PLATFORM_FEE_PERCENT / 100);
  return grossAmount - fee;
}

// Batch payout to multiple winners
export async function sendBatchPayouts(
  payouts: Array<{ address: string; amount: number }>
): Promise<{
  success: boolean;
  results: Array<{ address: string; amount: number; signature?: string; error?: string }>;
}> {
  const results = [];

  for (const payout of payouts) {
    const result = await sendPayout(payout.address, payout.amount);
    results.push({
      address: payout.address,
      amount: payout.amount,
      signature: result.signature,
      error: result.error,
    });

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const allSuccess = results.every(r => !r.error);
  return { success: allSuccess, results };
}
