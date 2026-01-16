'use client';

import { useEffect, useState } from 'react';
import { Check, X, Loader2, ExternalLink } from 'lucide-react';
import { useStore, PendingTransaction } from '@/store';
import { getExplorerUrl } from '@/lib/solana/config';

function TransactionItem({ tx }: { tx: PendingTransaction }) {
  const getStatusIcon = () => {
    switch (tx.status) {
      case 'pending':
      case 'confirming':
        return <Loader2 className="w-4 h-4 animate-spin text-[#D4A060]" />;
      case 'confirmed':
        return <Check className="w-4 h-4 text-[#5C8A4A]" />;
      case 'failed':
        return <X className="w-4 h-4 text-[#C45A4A]" />;
    }
  };

  const getStatusText = () => {
    switch (tx.status) {
      case 'pending':
        return 'Pending...';
      case 'confirming':
        return 'Confirming...';
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
    }
  };

  const getTypeText = () => {
    switch (tx.type) {
      case 'bet':
        return `${tx.side?.toUpperCase()} Bet`;
      case 'liquidity_add':
        return 'Add Liquidity';
      case 'liquidity_remove':
        return 'Remove Liquidity';
      case 'payout':
        return 'Claim Payout';
    }
  };

  const explorerUrl = getExplorerUrl(tx.signature);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
      tx.status === 'confirmed' ? 'bg-[#5C8A4A]/10 border-[#5C8A4A]/30'
        : tx.status === 'failed' ? 'bg-[#C45A4A]/10 border-[#C45A4A]/30'
        : 'bg-[#D4A060]/10 border-[#D4A060]/30'
    }`}>
      {getStatusIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[#3A4A2D] text-sm font-medium font-bambino">{getTypeText()}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            tx.status === 'confirmed' ? 'bg-[#5C8A4A]/20 text-[#5C8A4A]'
              : tx.status === 'failed' ? 'bg-[#C45A4A]/20 text-[#C45A4A]'
              : 'bg-[#D4A060]/20 text-[#D4A060]'
          }`}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-xs text-[#6B7B5E] font-satoshi">
          {tx.amount.toFixed(4)} SOL
        </div>
      </div>

      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 hover:bg-[#D4CDB8] rounded-lg transition-colors"
      >
        <ExternalLink className="w-4 h-4 text-[#6B7B5E]" />
      </a>
    </div>
  );
}

export function TransactionToast() {
  const { pendingTransactions } = useStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(pendingTransactions.length > 0);
  }, [pendingTransactions.length]);

  if (!isVisible || pendingTransactions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <div className="bg-[#F5F0E1] border-2 border-[#D4CDB8] rounded-2xl shadow-lg overflow-hidden">
        <div className="px-4 py-2 bg-[#EFEAD9] border-b border-[#D4CDB8]">
          <h4 className="text-[#3A4A2D] text-sm font-bold font-bambino">
            Transactions ({pendingTransactions.length})
          </h4>
        </div>
        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
          {pendingTransactions.slice(0, 5).map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransactionToast;
