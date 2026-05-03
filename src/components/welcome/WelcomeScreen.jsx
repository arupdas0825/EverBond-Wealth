import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Logo } from '../common/Logo';
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <Logo size={120} showText={false} />
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