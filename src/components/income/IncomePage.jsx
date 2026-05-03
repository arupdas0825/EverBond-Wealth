import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency } from '../../utils/finance';
import { CURRENCIES } from '../../constants/presets';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

export function IncomePage() {
  const { 
    partner1, partner2, p1Salary, p2Salary, mode, currency, 
    setP1Salary, setP2Salary, setMode, setCurrency, getTotalSalary 
  } = useFinanceStore();
  
  const totalSalary = getTotalSalary();
  const snapshot = calculateFinancialSnapshot(totalSalary, mode);
  const fmt = a => formatCurrency(a, currency);
  const symbol = CURRENCIES[currency]?.symbol || "₹";

  const [rates, setRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    fetch(`https://open.er-api.com/v6/latest/${currency}`)
      .then(res => res.json())
      .then(data => {
        if (data.result === "success") setRates(data.rates);
        setLoadingRates(false);
      })
      .catch(() => setLoadingRates(false));
  }, [currency]);

  const handleSalaryChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === "") setter(0);
    else {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) setter(parsed);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Shared <em>Engine</em></div>
          <div className="page-desc">The root configuration for your partnership wealth.</div>
        </div>
      </div>

      <div className="grid-2">
        <Card gold>
          <div className="card-title">{partner1}'s Contribution</div>
          <div className="card-subtitle">Monthly in-hand income</div>
          <div className="salary-wrapper">
            <span className="salary-prefix">{symbol}</span>
            <input
              className="salary-input"
              type="number"
              value={p1Salary === 0 ? "" : p1Salary}
              placeholder="0"
              onChange={handleSalaryChange(setP1Salary)}
            />
          </div>
        </Card>
        <Card gold>
          <div className="card-title">{partner2}'s Contribution</div>
          <div className="card-subtitle">Monthly in-hand income</div>
          <div className="salary-wrapper">
            <span className="salary-prefix">{symbol}</span>
            <input
              className="salary-input"
              type="number"
              value={p2Salary === 0 ? "" : p2Salary}
              placeholder="0"
              onChange={handleSalaryChange(setP2Salary)}
            />
          </div>
        </Card>
      </div>

      <Card className="mb-20 text-center" style={{ padding: '32px' }}>
        <div className="card-title">Combined Monthly Engine Power</div>
        <div className="card-value" style={{ 
          fontFamily: "'DM Serif Display', serif", 
          fontSize: '48px', 
          color: T.gold,
          margin: '16px 0',
          letterSpacing: '-1.5px'
        }}>
          {fmt(totalSalary)}
        </div>
        <div className="card-subtitle" style={{ marginBottom: 0 }}>
          Powering dynamic allocations and wealth projections.
        </div>
      </Card>

      <div className="grid-2-3">
        <Card className="mb-20">
          <div className="card-title">Accounting System</div>
          <div className="card-subtitle">Primary currency for all formulas</div>
          <select className="eb-select" value={currency} onChange={e => setCurrency(e.target.value)}>
            {Object.entries(CURRENCIES).map(([k, v]) => (
              <option key={k} value={k}>{v.flag} {v.name} ({v.symbol})</option>
            ))}
          </select>

          <hr className="divider" />
          
          <div className="card-title">Live Global Benchmark</div>
          <div className="card-subtitle">Display-only exchange references</div>
          
          {loadingRates ? (
            <div style={{ fontSize: '13px', color: T.textFaint }}>Syncing with global markets...</div>
          ) : rates ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { code: 'USD', name: 'US Dollar' },
                { code: 'EUR', name: 'Euro' },
                { code: 'CHF', name: 'Swiss Franc' },
                { code: 'GBP', name: 'British Pound' }
              ].filter(c => c.code !== currency).slice(0, 3).map(c => (
                <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' }}>
                  <span style={{ color: T.textMuted }}>1 {c.code}</span>
                  <span style={{ fontWeight: 600 }}>{symbol}{(1 / rates[c.code]).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: T.rose }}>Market sync failed.</div>
          )}
        </Card>

        <Card className="mb-20">
          <div className="card-title">Engine Risk Profile</div>
          <div className="card-subtitle">Dynamically adjusts needs, safety, and growth ratios</div>
          <div className="mode-grid">
            {[
              { key: "Conservative", icon: "🛡️", desc: "Safety Focus\n60% Needs · 30% Invest" },
              { key: "Balanced", icon: "⚖️", desc: "Balanced Growth\n55% Needs · 35% Invest" },
              { key: "Aggressive", icon: "🚀", desc: "Growth Focus\n50% Needs · 40% Invest" },
            ].map(m => (
              <div key={m.key} className={`mode-card ${mode === m.key ? "selected" : ""}`} onClick={() => setMode(m.key)}>
                <span className="mode-icon">{m.icon}</span>
                <div className="mode-name">{m.key}</div>
                <div className="mode-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-title">Engine Budget Distribution</div>
        <div className="card-subtitle">Mathematically accurate split of shared income</div>
        {[
          { color: T.sky, label: "Shared Essentials", pct: Math.round(snapshot.presets.needs * 100) + "%", val: fmt(snapshot.budget.needs) },
          { color: T.rose, label: "Safety / Emergency Fund", pct: Math.round(snapshot.presets.emergency * 100) + "%", val: fmt(snapshot.budget.emergency) },
          { color: T.gold, label: "Shared Investment Corpus", pct: Math.round(snapshot.presets.invest * 100) + "%", val: fmt(snapshot.budget.investments) },
        ].map(r => (
          <div key={r.label} className="alloc-row">
            <div className="alloc-name"><div className="alloc-dot" style={{ background: r.color }} />{r.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className="alloc-pct">{r.pct}</span>
              <span className="alloc-amount">{r.val}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
