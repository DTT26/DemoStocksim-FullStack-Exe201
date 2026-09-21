import { useState } from 'react';
import { Bell, Shield, Smartphone, Monitor, Save } from 'lucide-react';
import { useAlert } from '../../contexts/AlertContext';

export const StudentSettings = () => {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Dummy state for settings
  const [settings, setSettings] = useState({
    theme: 'dark',
    chartStyle: 'candles',
    notifications: {
      assignmentDue: true,
      simulationStart: true,
      tradeExecuted: false,
      priceAlerts: true,
      weeklyReport: false,
    },
    privacy: {
      showProfileOnLeaderboard: true,
      showPortfolioToLecturer: true,
    }
  });

  const handleSave = () => {
    // API Call to save settings would go here
    showAlert("Settings saved successfully.", "success");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 mt-2 text-lg">Manage your app preferences and notifications.</p>
      </div>

      <div className="bg-[#111827] rounded-2xl border border-[#253047] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#253047] p-4 bg-[#111827]">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium whitespace-nowrap ${
                activeTab === 'appearance' 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
              }`}
            >
              <Monitor className="w-5 h-5" />
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium whitespace-nowrap ${
                activeTab === 'notifications' 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium whitespace-nowrap ${
                activeTab === 'privacy' 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
              }`}
            >
              <Shield className="w-5 h-5" />
              Privacy
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium whitespace-nowrap ${
                activeTab === 'devices' 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              Devices
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 sm:p-8 bg-[#0a0f18]">
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Appearance</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Theme preference</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className={`relative border rounded-xl p-4 cursor-pointer transition-all ${settings.theme === 'dark' ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#253047] hover:border-slate-500'}`}>
                        <input 
                          type="radio" 
                          name="theme" 
                          value="dark" 
                          checked={settings.theme === 'dark'}
                          onChange={() => setSettings({...settings, theme: 'dark'})}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">Dark Mode</span>
                          {settings.theme === 'dark' && <div className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0f18]" />}
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Professional dark theme for trading (Recommended).</p>
                      </label>
                      
                      <label className={`relative border rounded-xl p-4 cursor-not-allowed opacity-50 ${settings.theme === 'light' ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#253047]'}`}>
                        <input 
                          type="radio" 
                          name="theme" 
                          value="light" 
                          disabled
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">Light Mode</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">Currently unavailable in this version.</p>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#253047]">
                    <h3 className="text-sm font-semibold text-white mb-3">Default Chart Style</h3>
                    <select 
                      value={settings.chartStyle}
                      onChange={(e) => setSettings({...settings, chartStyle: e.target.value})}
                      className="w-full sm:w-64 bg-[#172033] border border-[#253047] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="candles">Candlesticks</option>
                      <option value="bars">Bars</option>
                      <option value="line">Line</option>
                      <option value="area">Area</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Email Notifications</h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-[#253047] bg-[#111827]">
                      <div>
                        <h4 className="font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-sm text-slate-400 mt-1">Receive email alerts for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={() => setSettings({
                            ...settings, 
                            notifications: { ...settings.notifications, [key]: !value }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-[#253047] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Privacy Controls</h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-[#253047] bg-[#111827]">
                      <div>
                        <h4 className="font-medium text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={() => setSettings({
                            ...settings, 
                            privacy: { ...settings.privacy, [key]: !value }
                          })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-[#253047] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Active Sessions</h2>
                <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-start gap-4">
                  <Monitor className="w-6 h-6 text-indigo-400 shrink-0" />
                  <div>
                    <h4 className="font-medium text-white">Windows PC - Chrome</h4>
                    <p className="text-sm text-slate-400 mt-1">Ho Chi Minh City, VN • Current Session</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#253047] flex justify-end">
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
