import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'

const Settings = () => {
  const navigate = useNavigate()
  const { settings, updateSettings } = useGameStore()
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    updateSettings(localSettings)
    // Save to localStorage
    localStorage.setItem('chainReactionSettings', JSON.stringify(localSettings))
  }

  const handleReset = () => {
    const defaultSettings = {
      soundEnabled: true,
      musicEnabled: false,
      animationsEnabled: true,
      darkMode: true,
    }
    setLocalSettings(defaultSettings)
    updateSettings(defaultSettings)
    localStorage.setItem('chainReactionSettings', JSON.stringify(defaultSettings))
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="card p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">
              Settings
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Customize your game experience
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Audio Settings */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">🔊 Audio</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base">Sound Effects</div>
                    <div className="text-xs sm:text-sm text-slate-400">Play sound effects during gameplay</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={localSettings.soundEnabled}
                      onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base">Background Music</div>
                    <div className="text-xs sm:text-sm text-slate-400">Play background music</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={localSettings.musicEnabled}
                      onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Visual Settings */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">🎨 Visual</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base">Animations</div>
                    <div className="text-xs sm:text-sm text-slate-400">Enable smooth animations and effects</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={localSettings.animationsEnabled}
                      onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base">Dark Mode</div>
                    <div className="text-xs sm:text-sm text-slate-400">Use dark theme (always enabled)</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={localSettings.darkMode}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 sm:w-11 sm:h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-500 opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Game Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">🎮 Game</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Default Board Size</div>
                    <div className="text-sm text-slate-400">8×6 (Medium)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">Default Explosion Capacity</div>
                    <div className="text-sm text-slate-400">4 orbs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleSave}
              className="btn btn-primary flex-1 text-sm sm:text-base"
            >
              💾 Save Settings
            </button>
            <button
              onClick={handleReset}
              className="btn btn-secondary flex-1 text-sm sm:text-base"
            >
              🔄 Reset to Default
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary flex-1 text-sm sm:text-base"
            >
              ← Back to Menu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Settings 