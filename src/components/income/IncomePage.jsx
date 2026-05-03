import React, { useState, useEffect, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency } from '../../utils/finance';
import { CURRENCIES } from '../../constants/presets';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';

const MODES = [
  { key: 'Conservative', icon: '🛡️', desc: '60% Needs · 30% Invest' },
  { key: 'Balanced',     icon: '⚖️', desc: '55% Needs · 35% Invest' },
  { key: 'Aggressive',   icon: '🚀', desc: '50% Needs · 40% Invest' },
];

export function IncomePage() {
  const {
    partner1, partner2,
    p1Salary, p2Salary,
    mode, currency,
    setP1Salary, setP2Salary, setMode, setCurrency,
    getTotalSalary,
  } = useFinanceStore();

  const totalSalary = getTotalSalary();
  const snapshot = useMemo(() => calculateFinancialSnapshot(totalSalary, mode), [totalSalary, mode]);
  const fmt    = a => formatCurrency(a, currency);
  const symbol = CURRENCIES[currency]?.symbol || '₹';

  // Live exchange rates
  const [rates, setRates]         = useState(null);
  const [loadingRates, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://open.er-api.com/v6/latest/${currency}`)
      .then(r => r.json())
      .then(d => { if (d.result === 'success') setRates(d.rates); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currency]);

  const handleSalary = setter => e => {
    const v = parseFloat(e.target.value);
    setter(isNaN(v) ? 0 : v);
  };

  const budgetRows = [
    { dot: T.sky,     label: 'Shared Essentials',          pct: snapshot.presets.needs,      val: snapshot.budget.needs },
    { dot: T.rose,    label: 'Safety / Emergency Reserve',  pct: snapshot.presets.emergency,  val: snapshot.budget.emergency },
    { dot: T.goldMid, label: 'Shared Investment Corpus',   pct: snapshot.presets.invest,     val: snapshot.budget.investments },
  ];

  const compareCurrencies = Object.keys(CURRENCIES).filter(c => c !== currency).slice(0, 4);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-eyebrow">Shared Engine</div>
        <h1 className="page-title">Income & <em>Mode</em></h1>
        <p className="page-desc">
          Configure your combined income and risk profile. All allocations update in real-time.
        </p>
      </div>

      {/* Salary Inputs */}
      <div className="grid-2 mb-20">
        <Card gold>
          <div className="card-title">{partner1}'s Monthly Income</div>
          <div className="card-heading" style={{ marginBottom: 20 }}>Primary Contribution</div>
          <div className="salary-field">
            <span className="salary-prefix">{symbol}</span>
            <input
              className="salary-input"
              type="number"
              min={0}
              placeholder="0"
              value={p1Salary || ''}
              onChange={handleSalary(setP1Salary)}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: T.textFaint, marginTop: 10 }}>
            Monthly in-hand (after tax)
          </p>
        </Card>

        <Card gold>
          <div className="card-title">{partner2}'s Monthly Income</div>
          <div className="card-heading" style={{ marginBottom: 20 }}>Secondary Contribution</div>
          <div className="salary-field">
            <span className="salary-prefix">{symbol}</span>
            <input
              className="salary-input"
              type="number"
              min={0}
              placeholder="0"
              value={p2Salary || ''}
              onChange={handleSalary(setP2Salary)}
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: T.textFaint, marginTop: 10 }}>
            Monthly in-hand (after tax)
          </p>
        </Card>
      </div>

      {/* Combined Total */}
      <Card className="mb-20">
        <div className="combined-display">
          <div className="combined-label">Combined Monthly Engine Power</div>
          <div className="combined-value">{fmt(totalSalary)}</div>
          <p className="combined-sub">
            Powering dynamic allocations, projections &amp; goal timelines across your portfolio.
          </p>
        </div>
      </Card>

      {/* Risk Mode + Currency */}
      <div className="grid-2 mb-20">
        <Card>
          <div className="card-title">Risk Profile</div>
          <div className="card-heading" style={{ marginBottom: 6 }}>Allocation Mode</div>
          <p className="card-sub">
            Dynamically adjusts needs, safety &amp; growth ratios.
          </p>
          <div className="mode-grid">
            {MODES.map(m => (
              <div
                key={m.key}
                className={`mode-card ${mode === m.key ? 'selected' : ''}`}
                onClick={() => setMode(m.key)}
              >
                <span className="mode-icon">{m.icon}</span>
                <div>
                  <div className="mode-name">{m.key}</div>
                  <div className="mode-desc">{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-title">Accounting System</div>
          <div className="card-heading" style={{ marginBottom: 6 }}>Currency</div>
          <p className="card-sub">Primary display currency for all calculations.</p>
          <select
            className="eb-select"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            style={{ marginBottom: 24 }}
          >
            {Object.entries(CURRENCIES).map(([k, v]) => (
              <option key={k} value={k}>{v.flag} {v.name} ({v.symbol})</option>
            ))}
          </select>

          <div className="section-label">Live Global Rates</div>
          {loadingRates ? (
            <p style={{ fontSize: '0.82rem', color: T.textFaint }}>Syncing with global markets…</p>
          ) : rates ? (
            compareCurrencies.map(c => (
              <div key={c} className="rate-row">
                <span className="rate-label">1 {c} in {currency}</span>
                <span className="rate-value">
                  {symbol}{(1 / rates[c]).toFixed(4)}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.82rem', color: T.rose }}>Market sync unavailable.</p>
          )}
        </Card>
      </div>

      {/* Budget Distribution */}
      <Card>
        <div className="card-title">Live Budget Preview</div>
        <div className="card-heading" style={{ marginBottom: 6 }}>Engine Distribution</div>
        <p className="card-sub">
          Mathematically exact split of combined income based on {mode} profile.
        </p>
        {budgetRows.map(r => (
          <div key={r.label} className="alloc-row">
            <div className="alloc-name">
              <div className="alloc-dot" style={{ background: r.dot }} />
              {r.label}
            </div>
            <div className="alloc-right">
              <span className="alloc-pct">{Math.round(r.pct * 100)}%</span>
              <span className="alloc-amount">{fmt(r.val)}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}