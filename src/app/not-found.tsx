import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F0E1] flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Image
          src="/brand/mascot.png"
          alt="Not Found"
          width={80}
          height={80}
          className="mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold text-[#3A4A2D] mb-2 font-bambino">
          Page Not Found
        </h2>
        <p className="text-[#8B9B7E] mb-6 font-satoshi">
          Looks like you wandered into uncharted territory, soldier.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#6B7B5E] hover:bg-[#5A6A4D] text-white font-bold rounded-xl transition-all font-bambino"
        >
          Back to Base
        </Link>
      </div>
    </div>
  );
}
