import React from 'react';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerReset,
  sound
}) {
  if (!isOpen) return null;

  const handleSoundToggle = (e) => {
    const val = e.target.checked;
    onUpdateSettings({ sound_enabled: val });
  };

  const handleAnimationsToggle = (e) => {
    const val = e.target.checked;
    onUpdateSettings({ animations_enabled: val });
  };

  const handleThemeChange = (newTheme) => {
    onUpdateSettings({ theme: newTheme });
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Game Settings">
      <div className="modal-card modal-medium">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-title-icon">⚙️</span>
            <h2>Game Settings</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body settings-body">
          {/* Sound Control */}
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="sound-toggle" className="setting-label">Sound Effects</label>
              <span className="setting-desc">Procedural Web Audio API sound effects</span>
            </div>
            <div className="setting-control-group">
              {settings.sound_enabled && (
                <button
                  type="button"
                  className="btn-tiny"
                  onClick={() => sound?.playMatch?.()}
                  title="Test Sound"
                >
                  Test 🎵
                </button>
              )}
              <label className="switch">
                <input
                  id="sound-toggle"
                  type="checkbox"
                  checked={Boolean(settings.sound_enabled)}
                  onChange={handleSoundToggle}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          {/* Micro-Animations Control */}
          <div className="setting-item">
            <div className="setting-info">
              <label htmlFor="animations-toggle" className="setting-label">Smooth Animations</label>
              <span className="setting-desc">3D card flips, glows, and confetti effects</span>
            </div>
            <label className="switch">
              <input
                id="animations-toggle"
                type="checkbox"
                checked={Boolean(settings.animations_enabled)}
                onChange={handleAnimationsToggle}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Theme Selector */}
          <div className="setting-item flex-col">
            <div className="setting-info">
              <span className="setting-label">Atmosphere Theme</span>
              <span className="setting-desc">Tailored palette for the game arena</span>
            </div>
            <div className="theme-options">
              {[
                { id: 'midnight', name: 'Midnight Cyber', preview: '#0a0b1e' },
                { id: 'deep-space', name: 'Deep Nebula', preview: '#12072b' },
                { id: 'emerald', name: 'Emerald Vault', preview: '#051b14' }
              ].map(theme => (
                <button
                  key={theme.id}
                  className={`theme-pill ${settings.theme === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <span className="theme-color-dot" style={{ backgroundColor: theme.preview }}></span>
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="danger-zone">
            <div className="danger-info">
              <span className="danger-title">Reset Campaign & Records</span>
              <span className="danger-desc">
                Permanently wipes local SQLite database progress, locking Levels 2-10 and clearing high scores.
              </span>
            </div>
            <button
              className="btn btn-danger"
              onClick={onTriggerReset}
            >
              Reset All Progress
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
