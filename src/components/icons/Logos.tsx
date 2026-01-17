'use client';

import Image from 'next/image';

// Polymarket Logo - Using official logo image
export function PolymarketLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <Image
      src="/brand/polymarket-logo.png"
      alt="Polymarket"
      width={20}
      height={20}
      className={className}
    />
  );
}

// Kalshi Logo - Using official logo image
export function KalshiLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <Image
      src="/brand/kalshi-logo.png"
      alt="Kalshi"
      width={20}
      height={20}
      className={className}
    />
  );
}

// Discord Logo - Official
export function DiscordLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 199" fill="currentColor">
      <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fillRule="nonzero"/>
    </svg>
  );
}

// X (Twitter) Logo - Official
export function XLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/>
    </svg>
  );
}

// PumpBet Logo - Custom brand mark
export function PumpBetLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20 L12 4 L20 20"/>
      <path d="M7 14 L17 14"/>
    </svg>
  );
}

// Bitcoin Logo - Official from Simple Icons
export function BitcoinLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#F7931A">
      <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
    </svg>
  );
}

// Ethereum Logo - Official from Simple Icons
export function EthereumLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#627EEA">
      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
    </svg>
  );
}

// Solana Logo - Official from Simple Icons
export function SolanaLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#9945FF">
      <path d="m23.8764 18.0313-3.962 4.1393a.9201.9201 0 0 1-.306.2106.9407.9407 0 0 1-.367.0742H.4599a.4689.4689 0 0 1-.2522-.0733.4513.4513 0 0 1-.1696-.1962.4375.4375 0 0 1-.0314-.2545.4438.4438 0 0 1 .117-.2298l3.9649-4.1393a.92.92 0 0 1 .3052-.2102.9407.9407 0 0 1 .3658-.0746H23.54a.4692.4692 0 0 1 .2523.0734.4531.4531 0 0 1 .1697.196.438.438 0 0 1 .0313.2547.4442.4442 0 0 1-.1169.2297zm-3.962-8.3355a.9202.9202 0 0 0-.306-.2106.941.941 0 0 0-.367-.0742H.4599a.4687.4687 0 0 0-.2522.0734.4513.4513 0 0 0-.1696.1961.4376.4376 0 0 0-.0314.2546.444.444 0 0 0 .117.2297l3.9649 4.1394a.9204.9204 0 0 0 .3052.2102c.1154.049.24.0744.3658.0746H23.54a.469.469 0 0 0 .2523-.0734.453.453 0 0 0 .1697-.1961.4382.4382 0 0 0 .0313-.2546.4444.4444 0 0 0-.1169-.2297zM.46 6.7225h18.7815a.9411.9411 0 0 0 .367-.0742.9202.9202 0 0 0 .306-.2106l3.962-4.1394a.4442.4442 0 0 0 .117-.2297.4378.4378 0 0 0-.0314-.2546.453.453 0 0 0-.1697-.196.469.469 0 0 0-.2523-.0734H4.7596a.941.941 0 0 0-.3658.0745.9203.9203 0 0 0-.3052.2102L.1246 5.9687a.4438.4438 0 0 0-.1169.2295.4375.4375 0 0 0 .0312.2544.4512.4512 0 0 0 .1692.196.4689.4689 0 0 0 .2518.0739z"/>
    </svg>
  );
}

// Binance Logo - Official from Simple Icons
export function BinanceLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#F0B90B">
      <path d="M16.624 13.9202l2.7175 2.7154-7.353 7.353-7.353-7.352 2.7175-2.7164 4.6355 4.6595 4.6356-4.6595zm4.6366-4.6366L24 12l-2.7154 2.7164L18.5682 12l2.6924-2.7164zm-9.272.001l2.7163 2.6914-2.7164 2.7174v-.001L9.2721 12l2.7164-2.7154zm-9.2722-.001L5.4088 12l-2.6914 2.6924L0 12l2.7164-2.7164zM11.9885.0115l7.353 7.329-2.7174 2.7154-4.6356-4.6356-4.6355 4.6595-2.7174-2.7154 7.353-7.353z"/>
    </svg>
  );
}

// NBA Logo - Official from Simple Icons
export function NBALogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#17408B">
      <path d="M9.19 0a2.486 2.486 0 0 0-2.485 2.484v19.029A2.488 2.488 0 0 0 9.19 24h5.615a2.493 2.493 0 0 0 2.49-2.487V2.484A2.488 2.488 0 0 0 14.81 0zm0 .584h3.21c-.62.237-.707.508-.73 1.366-.105.01-.325-.087-.25.434 0 0 .043.346.18.286-.133.918.023.99-.93 1.031l-.047.067c-.95.093-1.25-.027-2.05 1.603 0 0-.207.505-.268.714-.197.415-.674 1.328-.819 1.919-.046.2-.14.264-.01.553.185.417-.124.527.95.496V9.3s-.286.247-.346.398c-.061.147-.226.89-.22 1.237.019.917.767 1.683.992 2.597l.492.07c.282.634 1.495 2.355 1.743 2.582.057.159.365.355.545.551.149.141 1.025 1.1 2.054 1.692-.007-.001.164.344.249.618-.342.275.32.777.52 1.609.012.107-.19.222.114.495-.022 1.256-.402 1.918.241 2.266H9.191a1.9 1.9 0 0 1-1.9-1.901V2.486a1.9 1.9 0 0 1 1.9-1.902zm3.804.002h1.815a1.9 1.9 0 0 1 1.897 1.898v9.193a1.653 1.653 0 0 0-.22-.397c0-.255-.272-.249-.346-.344-.07-.081.067-.128-.407-.235-.09-.05-.158-.747-.158-.747-.07-.447-.229-.754-.467-1.227-.12-.243-.177-1.001-.305-1.386.071-1.767-.493-2.28-.95-2.569-.174-.11-.262-.191-.433-.29l-.005-.082c-.133-.126-.402-.264-.623-.362-.068-.07-.037-.22.01-.276.15-.02.348-.356.513-.703.129.009.174-.118.214-.19.138-.222.288-.413.096-.542.435-.777.154-1.301-.08-1.321-.095-.195-.26-.316-.551-.42zm.551 6.338c.06.319.34 1.929.456 2.187.123.259.535 1.05.73 1.54a1.69 1.69 0 0 0-1.294 1.646 1.692 1.692 0 0 0 1.693 1.691 1.692 1.692 0 0 0 1.576-1.066v8.59a1.887 1.887 0 0 1-1.598 1.877h-.017c.833-.502.319-1.46.16-2.022-.012-.033.014-.074.026-.1.045-.08-.045-.257-.045-.257-.098-.09-.127-.561-.182-.772-.089-.358.157-.971.157-1.18 0-.206-.156-.491-.445-.858-.069-.078-.276-1.86-.462-2.313-.258-.623-.339-.526-.64-1.266-.24-.525-.055-1.295-.59-3.085.005.006.12-.113.12-.113s-.422-1.55-.561-1.975c-.14-.426-.385-.456-.385-.456s.002-.172.012-.216c.02-.07.516-1.367.558-1.407.001-.03.717-.514.731-.445Z"/>
    </svg>
  );
}

// NFL Logo - Simplified shield
export function NFLLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#013369">
      <path d="M12 0C5.4 0 0 1.6 0 3.6v12c0 4.8 5.4 8.4 12 8.4s12-3.6 12-8.4v-12C24 1.6 18.6 0 12 0zm0 2c5.5 0 10 1.1 10 2.5 0 1.4-4.5 2.5-10 2.5S2 5.9 2 4.5C2 3.1 6.5 2 12 2zm6 13l-3-2v-3l3 2v3zm-4-3.5L12 10l-2 1.5V15l2-1.5 2 1.5v-3.5zm-6 .5l3 2v3l-3-2v-3z"/>
      <text x="12" y="19" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">NFL</text>
    </svg>
  );
}

// ESPN Logo
export function ESPNLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF0033">
      <rect width="24" height="24" rx="4"/>
      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">ESPN</text>
    </svg>
  );
}

// Coinbase Logo
export function CoinbaseLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0052FF">
      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 18.6a6.6 6.6 0 1 1 0-13.2 6.6 6.6 0 0 1 0 13.2zm3.6-6.6a3.6 3.6 0 1 1-7.2 0 3.6 3.6 0 0 1 7.2 0z"/>
    </svg>
  );
}

// USDC Logo
export function USDCLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#2775CA">
      <circle cx="12" cy="12" r="12"/>
      <path fill="white" d="M12 4.5c-4.14 0-7.5 3.36-7.5 7.5s3.36 7.5 7.5 7.5 7.5-3.36 7.5-7.5-3.36-7.5-7.5-7.5zm.75 12.75v.75h-1.5v-.75c-1.5-.225-2.625-1.05-2.775-2.325h1.35c.15.75.825 1.275 1.95 1.275 1.275 0 1.725-.6 1.725-1.2 0-.825-.525-1.2-1.875-1.5-1.8-.375-3-1.05-3-2.55 0-1.2.975-2.1 2.625-2.325V7.5h1.5v.9c1.35.3 2.175 1.125 2.25 2.25h-1.35c-.075-.675-.6-1.125-1.5-1.125-1.05 0-1.575.45-1.575 1.125 0 .6.375 1.05 1.725 1.35 1.8.375 3.15 1.05 3.15 2.7 0 1.425-1.125 2.25-2.7 2.55z"/>
    </svg>
  );
}

// Tether (USDT) Logo
export function TetherLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#26A17B">
      <circle cx="12" cy="12" r="12"/>
      <path fill="white" d="M13.5 10.5v-3h3v-1.5h-9v1.5h3v3c-3 .15-5.25 1.05-5.25 2.1 0 1.2 2.85 2.175 6.375 2.175s6.375-.975 6.375-2.175c0-1.05-2.25-1.95-5.25-2.1zm-.75 3.45c-2.625 0-4.75-.6-4.75-1.35 0-.6 1.5-1.125 3.625-1.275v2.025c.375.025.75.05 1.125.05s.75-.025 1.125-.05v-2.025c2.125.15 3.625.675 3.625 1.275 0 .75-2.125 1.35-4.75 1.35z"/>
    </svg>
  );
}

// Generic Sports Logo (for fallback)
export function SportsLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#22c55e">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2a10 10 0 0 1 0 20" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// Key icon for wallet
export function KeyIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

// Settings icon
export function SettingsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

// Wallet Icon
export function WalletIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
    </svg>
  );
}

// Chart Icon
export function ChartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  );
}

// Globe Icon
export function GlobeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

// Fire/Trending Icon
export function TrendingIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
    </svg>
  );
}
