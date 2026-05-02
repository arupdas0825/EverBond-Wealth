import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CURRENCIES } from '../../constants/presets';
import { T } from '../../theme/tokens';
import { Logo } from '../common/Logo';

const REGIONS = [
  "India", "Germany", "Switzerland", "USA", "UK", "Canada", "Singapore", "UAE"
];

export function WelcomeScreen() {
  const setProfile = useFinanceStore(state => state.setProfile);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [region, setRegion] = useState("India");
  const [currency, setCurrency] = useState("INR");

  const handleStart = () => {
    if (!p1.trim() || !p2.trim()) {
      alert("Please enter both partner names to begin your journey together ✨");
      return;
    }
    setProfile({ 
      partner1: p1.trim(), 
      partner2: p2.trim(), 
      region, 
      currency 
    });
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-card fade-in">
        <div className="welcome-logo">
          <Logo size={48} showText={false} className="mb-12" />
          <div className="welcome-logo-text">
            EverBond <span>Wealth</span>
          </div>
        </div>
        
        <p className="welcome-tagline">
          Premium financial planning for modern couples.<br />
          One beautiful space for your shared dreams & wealth.
        </p>

        <div className="partner-grid">
          <div>
            <label className="form-label">Partner 1</label>
            <input 
              className="eb-input" 
              placeholder="e.g. Arup" 
              value={p1} 
              onChange={e => setP1(e.target.value)} 
            />
          </div>
          <div>
            <label className="form-label">Partner 2</label>
            <input 
              className="eb-input" 
              placeholder="e.g. Shatarupa" 
              value={p2} 
              onChange={e => setP2(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid-2" style={{ gap: '14px', marginBottom: '18px' }}>
          <div>
            <label className="form-label">Region / Country</label>
            <select className="eb-select" value={region} onChange={e => setRegion(e.target.value)}>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Currency</label>
            <select className="eb-select" value={currency} onChange={e => setCurrency(e.target.value)}>
              {Object.entries(CURRENCIES).map(([k, v]) => (
                <option key={k} value={k}>{v.flag} {k}</option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn-primary" onClick={handleStart}>Begin Our Journey together →</button>
        
        <p style={{ textAlign: "center", fontSize: 12, color: T.textFaint, marginTop: 20, fontStyle: 'italic' }}>
          Your data is encrypted and saved only on this device.
        </p>
      </div>
    </div>
  );
}
