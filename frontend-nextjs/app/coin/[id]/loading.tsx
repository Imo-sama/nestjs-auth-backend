export default function CoinLoading() {
  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-purple-500/30 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
        </div>
        <div className="text-white text-xl font-medium animate-pulse">Loading coin data...</div>
        <div className="text-gray-400 text-sm mt-2">Please wait</div>
      </div>
    </div>
  )
}
