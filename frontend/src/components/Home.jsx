import { Clock, BarChart3, Users } from 'lucide-react';

function Home() {
  return (
    <div className="min-w-screen min-h-screen bg-black font-inter overflow-hidden">
      <nav className="w-full h-20 border-b border-zinc-800 flex items-center justify-between px-8">
        <a href="/">
          <h1 className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent text-5xl font-bold tracking-tight hover:scale-105 transition-transform">
            Yeld
          </h1>
        </a>
        <div className="flex gap-4">
          <a href="/login"
            className="bg-black text-white py-3 px-8 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25">
            Sign In
          </a>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto mt-12 px-8">
        <div className="text-center">
          <h2 className="p-5 text-5xl font-bold bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent mb-6">
            Master Your Time, Amplify Your Progress
          </h2>
          <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
            Boost your productivity with custom Pomodoro timers and detailed progress tracking.
          </p>
          <a href="/login"
            className="inline-block bg-black text-white py-4 px-12 rounded-xl font-semibold hover:bg-zinc-900 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25 text-lg mb-12">
            Get Started
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl flex-1 min-w-64 max-w-96">
            <Clock className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-gray-200 text-xl font-semibold mb-3">Smart Timers</h3>
            <p className="text-gray-400">Customize your focus sessions with intelligent Pomodoro timers</p>
          </div>
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl flex-1 min-w-64 max-w-96">
            <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-gray-200 text-xl font-semibold mb-3">Progress Tracking</h3>
            <p className="text-gray-400">Visualize your productivity journey with detailed analytics</p>
          </div>
          <div className="bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-xl flex-1 min-w-64 max-w-96">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-gray-200 text-xl font-semibold mb-3">Personal Profiles</h3>
            <p className="text-gray-400">Track your achievements and set personalized goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;