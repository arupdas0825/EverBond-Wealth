import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CURRENCIES } from '../../constants/presets';
import { LogoMark } from '../common/Logo';
import { T } from '../../theme/tokens';

const REGIONS = [
  "India", "Germany", "Switzerland", "USA", "UK", "Canada", "Singapore", "UAE"
];

export function WelcomeScreen() {
  const setProfile = useFinanceStore(s => s.setProfile);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [region, setRegion] = useState('India');
  const [currency, setCurrency] = useState('INR');
  const [shake, setShake] = useState(false);

  const handleStart = () => {
    if (!p1.trim() || !p2.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setProfile({ partner1: p1.trim(), partner2: p2.trim(), region, currency });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleStart();
  };

  return (
    <div className="welcome-wrap">
      {/* Ambient background */}
      <div className="welcome-bg-orb welcome-bg-orb-1" />
      <div className="welcome-bg-orb welcome-bg-orb-2" />

      <div className={`welcome-card${shake ? ' shake' : ''}`} style={shake ? { animation: 'shake 0.4s ease' } : {}}>

        {/* Logo */}
        <div className="welcome-logo-row">
          <div className="welcome-logo-mark">
            <LogoMark size={22} />
          </div>
          <div className="welcome-brand">EverBond <span>Wealth</span></div>
        </div>

        {/* Headline */}
        <h1 className="welcome-headline">
          Build your <em>future</em>,<br />together.
        </h1>

        <p className="welcome-sub">
          Premium financial planning for modern couples.<br />
          One elegant space for your shared dreams &amp; wealth.
        </p>

        {/* Partner names */}
        <div className="form-grid-2" style={{ marginBottom: 14 }}>
          <div className="form-group">
            <label className="form-label">Partner 1 Name</label>
            <input
              className="eb-input"
              placeholder="e.g. Arup"
              value={p1}
              onChange={e => setP1(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="given-name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Partner 2 Name</label>
            <input
              className="eb-input"
              placeholder="e.g. Shatarupa"
              value={p2}
              onChange={e => setP2(e.target.value)}
              onKeyDown={handleKey}
              autoComplete="given-name"
            />
          </div>
        </div>

        {/* Region & Currency */}
        <div className="form-grid-2" style={{ marginBottom: 28 }}>
          <div className="form-group">
            <label className="form-label">Country / Region</label>
            <select className="eb-select" value={region} onChange={e => setRegion(e.target.value)}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="eb-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              {Object.entries(CURRENCIES).map(([k, v]) => (
                <option key={k} value={k}>{v.flag} {k} — {v.symbol}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleStart}>
          Begin Our Journey Together →
        </button>

        <p className="welcome-note">
          Your data is stored only on this device. No account needed.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}