export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#D4CDB8] border-t-[#6B7B5E] rounded-full animate-spin" />
        <p className="text-[#8B9B7E] font-bambino">Loading...</p>
      </div>
    </div>
  );
}
