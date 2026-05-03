import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CURRENCIES, REGIONS } from '../../constants/presets';
export function WelcomeScreen() {
  const setProfile = useFinanceStore(s => s.setProfile);
  const [p1,setP1]=useState(''); const [p2,setP2]=useState('');
  const [region,setRegion]=useState('India'); const [currency,setCurrency]=useState('INR');
  const [err,setErr]=useState(false);
  const start = () => {
    if (!p1.trim()||!p2.trim()) { setErr(true); setTimeout(()=>setErr(false),600); return; }
    setProfile({partner1:p1.trim(),partner2:p2.trim(),region,currency});
  };
  return (
    <div className="welcome-wrap">
      <div className="wbg-orb wbg-1"/><div className="wbg-orb wbg-2"/>
      <div className={`welcome-card${err?' card-shake':''}`}>
        <div className="wc-logo-row">
          <div className="wc-icon">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <defs><linearGradient id="lg-wc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" stopOpacity=".9"/><stop offset="100%" stopColor="#F5E9C8"/>
              </linearGradient></defs>
              <circle cx="15" cy="20" r="8" stroke="url(#lg-wc)" strokeWidth="2.2" fill="none"/>
              <circle cx="25" cy="20" r="8" stroke="url(#lg-wc)" strokeWidth="2.2" fill="none"/>
              <path d="M20 23V17M17.5 19.5L20 17L22.5 19.5" stroke="url(#lg-wc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="wc-brand">EverBond <span>Wealth</span></div>
        </div>
        <h1 className="wc-headline">Build your <em>future</em>,<br/>together.</h1>
        <p className="wc-sub">Premium financial planning for modern couples.<br/>One elegant space for your shared dreams &amp; wealth.</p>
        <div className="form-grid-2" style={{marginBottom:13}}>
          <div className="form-group">
            <label className="form-label">Partner 1</label>
            <input className="eb-input" placeholder="e.g. Arup" value={p1} onChange={e=>setP1(e.target.value)} onKeyDown={e=>e.key==='Enter'&&start()}/>
          </div>
          <div className="form-group">
            <label className="form-label">Partner 2</label>
            <input className="eb-input" placeholder="e.g. Shatarupa" value={p2} onChange={e=>setP2(e.target.value)} onKeyDown={e=>e.key==='Enter'&&start()}/>
          </div>
        </div>
        <div className="form-grid-2" style={{marginBottom:26}}>
          <div className="form-group">
            <label className="form-label">Country / Region</label>
            <select className="eb-select" value={region} onChange={e=>setRegion(e.target.value)}>
              {REGIONS.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="eb-select" value={currency} onChange={e=>setCurrency(e.target.value)}>
              {Object.entries(CURRENCIES).map(([k,v])=>(
                <option key={k} value={k}>{v.flag} {k} — {v.symbol}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-primary" onClick={start}>Begin Our Journey Together →</button>
        <p className="wc-note">Your data is stored only on this device. No account required.</p>
      </div>
      <style>{`.card-shake{animation:cardShake .45s ease}
@keyframes cardShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}