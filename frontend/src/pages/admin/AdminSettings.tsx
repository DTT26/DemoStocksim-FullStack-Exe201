import { useState } from 'react';
import { Settings, Palette, Bell, Wrench, Save, X, AlertTriangle, CheckCircle } from 'lucide-react';

type SettingsTab = 'general' | 'appearance' | 'notifications' | 'maintenance';

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [saved, setSaved] = useState(false);

  // All settings are local state — no backend endpoint exists
  const [general, setGeneral] = useState({
    platformName: 'StockSim',
    defaultMarket: 'Vietnam (HOSE, HNX)',
    description: 'A comprehensive stock trading simulation platform for educational purposes.',
  });
  const [appearance, setAppearance] = useState({ theme: 'dark', accent: 'blue' });
  const [notifications, setNotifications] = useState({
    newUser: true, simCreated: true, simStarted: true, simCompleted: false, systemAlerts: true,
  });
  const [maintenance, setMaintenance] = useState({ mode: false });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-slate-400 mt-2 text-lg">Manage platform configuration and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg p-2 flex lg:flex-col gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#172033]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#111827] rounded-xl border border-[#1e293b] shadow-lg">
          {/* General */}
          {activeTab === 'general' && (
            <div>
              <div className="p-6 border-b border-[#1e293b] bg-[#172033]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-blue-400" /> General Settings</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Platform Name</label>
                  <input type="text" value={general.platformName} onChange={e => setGeneral({ ...general, platformName: e.target.value })} className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Default Market</label>
                  <select value={general.defaultMarket} onChange={e => setGeneral({ ...general, defaultMarket: e.target.value })} className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm">
                    <option>Vietnam (HOSE, HNX)</option>
                    <option>US (NYSE, NASDAQ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">System Description</label>
                  <textarea rows={3} value={general.description} onChange={e => setGeneral({ ...general, description: e.target.value })} className="w-full bg-[#172033] border border-[#1e293b] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm resize-none" />
                </div>
                <div className="pt-4 border-t border-[#1e293b] flex justify-end">
                  <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div>
              <div className="p-6 border-b border-[#1e293b] bg-[#172033]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Palette className="w-5 h-5 text-blue-400" /> Appearance</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Theme</label>
                  <div className="flex gap-3">
                    {['dark', 'system'].map(t => (
                      <button key={t} onClick={() => setAppearance({ ...appearance, theme: t })} className={`px-5 py-3 rounded-lg border text-sm font-medium transition-all ${
                        appearance.theme === t ? 'bg-blue-600/10 text-blue-400 border-blue-500/30' : 'bg-[#172033] text-slate-400 border-[#1e293b] hover:border-slate-600'
                      }`}>
                        {t === 'dark' ? '🌙 Dark' : '💻 System Default'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Accent Color</label>
                  <div className="flex gap-3">
                    {[
                      { id: 'blue', label: 'Blue', color: '#3B82F6' },
                      { id: 'indigo', label: 'Indigo', color: '#6366F1' },
                      { id: 'emerald', label: 'Emerald', color: '#10B981' },
                    ].map(c => (
                      <button key={c.id} onClick={() => setAppearance({ ...appearance, accent: c.id })} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        appearance.accent === c.id ? 'border-blue-500/30 bg-blue-600/10 text-white' : 'bg-[#172033] text-slate-400 border-[#1e293b] hover:border-slate-600'
                      }`}>
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }}></span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-[#1e293b] flex justify-end">
                  <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <div className="p-6 border-b border-[#1e293b] bg-[#172033]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-blue-400" /> Notification Preferences</h2>
              </div>
              <div className="p-6 space-y-1">
                {[
                  { key: 'newUser' as const, label: 'New User Registration', desc: 'Get notified when a new user joins the platform.' },
                  { key: 'simCreated' as const, label: 'Simulation Created', desc: 'Notified when a lecturer creates a new simulation.' },
                  { key: 'simStarted' as const, label: 'Simulation Started', desc: 'Notified when a simulation goes live.' },
                  { key: 'simCompleted' as const, label: 'Simulation Completed', desc: 'Notified when a simulation finishes.' },
                  { key: 'systemAlerts' as const, label: 'System Alerts', desc: 'Critical system alerts and warnings.' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-[#1e293b] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-blue-600' : 'bg-[#1e293b]'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${notifications[item.key] ? 'translate-x-5' : ''}`}></span>
                    </button>
                  </div>
                ))}
                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance */}
          {activeTab === 'maintenance' && (
            <div>
              <div className="p-6 border-b border-[#1e293b] bg-[#172033]">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Wrench className="w-5 h-5 text-blue-400" /> Maintenance</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#172033] rounded-xl border border-[#1e293b]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <div>
                      <p className="text-sm font-medium text-white">System Status</p>
                      <p className="text-xs text-emerald-400 font-medium">Operational</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#172033] rounded-xl border border-[#1e293b]">
                  <div>
                    <p className="text-sm font-medium text-white">Maintenance Mode</p>
                    <p className="text-xs text-slate-500 mt-0.5">Users may temporarily lose access to the platform when enabled.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (!maintenance.mode) setShowMaintenanceModal(true);
                      else setMaintenance({ mode: false });
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${maintenance.mode ? 'bg-rose-600' : 'bg-[#1e293b]'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${maintenance.mode ? 'translate-x-5' : ''}`}></span>
                  </button>
                </div>

                {maintenance.mode && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-rose-400">Maintenance Mode is Active</p>
                      <p className="text-xs text-rose-400/70 mt-0.5">Users cannot access the platform. Disable this when maintenance is complete.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4 text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Settings saved successfully!
        </div>
      )}

      {/* Maintenance Confirmation Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowMaintenanceModal(false)}>
          <div className="bg-[#111827] rounded-2xl border border-[#1e293b] shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[#1e293b] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Enable Maintenance Mode?</h3>
              <button onClick={() => setShowMaintenanceModal(false)} className="p-1 text-slate-400 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">Users may temporarily lose access to the platform. Only enable this during planned maintenance windows.</p>
              </div>
            </div>
            <div className="p-6 border-t border-[#1e293b] flex justify-end gap-3">
              <button onClick={() => setShowMaintenanceModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-300 bg-[#172033] border border-[#1e293b] rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { setMaintenance({ mode: true }); setShowMaintenanceModal(false); }} className="px-5 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-lg shadow-rose-600/20">
                Enable Maintenance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
