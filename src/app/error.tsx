'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F0E1] flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Image
          src="/brand/mascot.png"
          alt="Error"
          width={80}
          height={80}
          className="mx-auto mb-6 opacity-50"
        />
        <h2 className="text-2xl font-bold text-[#3A4A2D] mb-2 font-bambino">
          Something went wrong!
        </h2>
        <p className="text-[#8B9B7E] mb-6 font-satoshi">
          Don&apos;t worry, even the best traders hit a bump sometimes.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#6B7B5E] hover:bg-[#5A6A4D] text-white font-bold rounded-xl transition-all font-bambino"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
