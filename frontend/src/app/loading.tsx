import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/70 dark:bg-gray-950/70 backdrop-blur-md transition-opacity duration-300">
      <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-800/20 shadow-2xl shadow-gray-200/50 dark:shadow-none">
        {/* Spinner */}
        <div className="relative flex items-center justify-center w-20 h-20">
          {/* Animated gradient ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-950/50" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 animate-spin" />
          
          {/* Inner Brand Mark */}
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">B</span>
          </div>
        </div>
        
        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">SREE BALAJI FRAMES AND GIFTS</h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 animate-pulse">
            Loading beautiful things...
          </p>
        </div>
      </div>
    </div>
  )
}
