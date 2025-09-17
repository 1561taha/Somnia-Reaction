import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const OnlineGame = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="card p-8 text-center">
          <div className="text-6xl mb-6">🌐</div>
          <h1 className="text-3xl font-bold text-gradient mb-4">
            Online Multiplayer
          </h1>
          <p className="text-slate-400 mb-8">
            Online multiplayer functionality is coming soon! This will include:
          </p>
          
          <div className="space-y-3 text-left mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Private lobbies and matchmaking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Real-time game synchronization</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Chat and emoji reactions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Player profiles and statistics</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">Spectator mode</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            ← Back to Main Menu
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default OnlineGame 