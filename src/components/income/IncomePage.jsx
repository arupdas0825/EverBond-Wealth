import React, { useState, useEffect, useMemo } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateFinancialSnapshot, formatCurrency } from '../../utils/finance';
import { totalMilestoneContribution } from '../../utils/milestones';
import { CURRENCIES } from '../../constants/presets';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { Heart, Lock } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';


const MODES = [
  { key: 'Conservative', icon: '🛡️', desc: '60% Needs · 30% Invest\nSafety-first approach' },
  { key: 'Balanced',     icon: '⚖️', desc: '55% Needs · 35% Invest\nBalanced growth' },
  { key: 'Aggressive',   icon: '🚀', desc: '50% Needs · 40% Invest\nGrowth-focused' },
];

export function IncomePage() {
  const { partner1, partner2, p1Salary, p2Salary, mode, currency, milestones, stage,
    partnerAccepted, setP1Salary, setP2Salary, setMode, setCurrency, getTotalSalary } = useFinanceStore();
  
  const { t } = useTranslation();
  const total = getTotalSalary();
  const snap  = useMemo(() => calculateFinancialSnapshot(total, mode), [total, mode]);
  const mContribution = useMemo(() => totalMilestoneContribution(milestones), [milestones]);
  const fmt   = a => formatCurrency(a, currency);
  const sym   = CURRENCIES[currency]?.symbol || '₹';
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://open.er-api.com/v6/latest/${currency}`)
      .then(r => r.json())
      .then(d => { if (d.result === 'success') setRates(d.rates); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [currency]);

  const handleSalary = setter => e => { const v = parseFloat(e.target.value); setter(isNaN(v) ? 0 : v); };

  return (
    <div className="fade-in">
      <div className="eb-page-header">
        <span className="page-eyebrow">{t('shared_engine', 'Shared Engine')}</span>
        <h1 className="page-title">{t('income', 'Income & Mode')}</h1>
        <p className="page-desc">{t('income_desc', 'Configure combined income and risk profile. All allocations update live.')}</p>
      </div>
      <div className="grid-2 mb-20">
        <Card gold>
          <div className="card-title">
            {partner1 ? t('partner_s_contribution', "{name}'s Contribution").replace('{name}', partner1) : t('your_contribution', "Your Contribution")}
          </div>
          <div className="card-heading mb-16">{t('monthly_income', 'Monthly Income')}</div>
          <div className="salary-field">
            <span className="salary-prefix">{sym}</span>
            <input className="salary-input" type="number" min={0} placeholder="0"
              value={p1Salary || ''} onChange={handleSalary(setP1Salary)}/>
          </div>
          <p style={{ fontSize: '.78rem', color: T.textFaint, marginTop: 8 }}>{t('monthly_in_hand', 'Monthly in-hand (after tax)')}</p>
        </Card>
        
        <Card gold style={{ position: 'relative' }}>
          <div className="card-title">
            {stage === 'Single' 
              ? t('partner_s_contribution_label', "Partner's Contribution") 
              : partner2 
                ? t('partner_s_contribution', "{name}'s Contribution").replace('{name}', partner2) 
                : t('partner_s_contribution_label', "Partner's Contribution")}
          </div>
          <div className="card-heading mb-16">{t('monthly_income', 'Monthly Income')}</div>
          <div className="salary-field">
            <span className="salary-prefix">{sym}</span>
            <input className="salary-input" type="number" min={0} placeholder="0"
              value={stage === 'Single' ? '' : p2Salary || ''} 
              disabled={!partnerAccepted}
              onChange={handleSalary(setP2Salary)}/>
          </div>
          <p style={{ fontSize: '.78rem', color: T.textFaint, marginTop: 8 }}>{t('monthly_in_hand', 'Monthly in-hand (after tax)')}</p>

          {/* Partnership lock for second income slot */}
          {!partnerAccepted && (
            <div className="glass-lock-screen" style={{ borderRadius: 'var(--r-lg)', padding: '16px' }}>
              <div className="lock-screen-inner" style={{ padding: '0 8px' }}>
                <div className="lock-icon-glow" style={{ width: '40px', height: '40px', fontSize: '1.1rem', marginBottom: '8px' }}>
                  <Lock size={15} />
                </div>
                <h4 className="lock-title" style={{ fontSize: '1.05rem', marginBottom: '4px' }}>{t('combined_income', 'Combined Income')}</h4>
                <p className="lock-desc" style={{ fontSize: '0.74rem', marginBottom: '12px' }}>
                  {stage === 'Single' 
                    ? t('sync_ledger_desc', "Sync your ledger with a partner to unlock the second active monthly income slot.")
                    : t('invite_partner_desc', "Invite your partner to sync combined incomes and plan together.")}
                </p>
                <button 
                  className="btn-primary" 
                  style={{ background: stage === 'Married' ? T.gold : stage === 'Committed' ? T.rose : T.sky, fontSize: '0.74rem', padding: '6px 12px', width: 'auto' }}
                  onClick={() => alert(t('sync_income_alert', "🔗 To sync incomes, go to the Dashboard and use the Partner Connection status widget to invite your partner!"))}
                >
                  {stage === 'Single' ? t('sync_partner_ledger', "Sync Partner Ledger") : t('connect_partner', "Connect Partner")}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
      <Card className="mb-20">
        <div className="combined-display">
          <div className="combined-label">
            {stage === 'Single' ? t('solo_engine_power', "Your Active Monthly Engine Power") : t('combined_engine_power', "Combined Monthly Engine Power")}
          </div>
          <div className="combined-value">{fmt(total)}</div>
          <p className="combined-sub">{t('engine_power_sub', "Driving all allocations, projections & goal timelines.")}</p>
        </div>
      </Card>
      <div className="grid-2 mb-20">
        <Card>
          <div className="card-title">{t('risk_profile', 'Risk Profile')}</div>
          <div className="card-heading mb-8">{t('allocation_mode', 'Allocation Mode')}</div>
          <p className="card-sub">{t('allocation_mode_desc', 'Dynamically adjusts all ratios from the Excel preset engine.')}</p>
          <div className="mode-grid">
            {MODES.map(m => (
              <div key={m.key} className={`mode-card ${mode === m.key ? 'selected' : ''}`} onClick={() => setMode(m.key)}>
                <span className="mode-icon">{m.icon}</span>
                <div>
                  <div className="mode-name">{t('mode_' + m.key.toLowerCase(), m.key)}</div>
                  <div className="mode-desc">{t('mode_desc_' + m.key.toLowerCase(), m.desc)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="card-title">{t('currency_and_rates', 'Currency & Rates')}</div>
          <div className="card-heading mb-8">{t('accounting_system', 'Accounting System')}</div>
          <p className="card-sub">{t('accounting_system_sub', 'Primary currency for all calculations. Formulas stay identical.')}</p>
          <select className="eb-select mb-20" value={currency} onChange={e => setCurrency(e.target.value)}>
            {Object.entries(CURRENCIES).map(([k, v]) => (
              <option key={k} value={k}>{v.flag} {v.name} ({v.symbol})</option>
            ))}
          </select>
          <div className="section-label">{t('live_benchmark', 'Live Global Benchmark')}</div>
          {loading ? <p style={{ fontSize: '.82rem', color: T.textFaint }}>{t('syncing_markets', 'Syncing markets…')}</p>
            : rates ? Object.keys(CURRENCIES).filter(c => c !== currency).slice(0, 4).map(c => (
              <div key={c} className="rate-row">
                <span className="rate-label">1 {c}</span>
                <span className="rate-value">{sym}{(1 / rates[c]).toFixed(4)}</span>
              </div>
            )) : <p style={{ fontSize: '.82rem', color: T.rose }}>{t('market_sync_unavailable', 'Market sync unavailable.')}</p>
          }
        </Card>
      </div>
      <Card>
        <div className="card-title">{t('live_budget_preview', 'Live Budget Preview')}</div>
        <div className="card-heading mb-8">{t('engine_distribution', 'Engine Distribution')}</div>
        <p className="card-sub">
          {t('exact_split', 'Exact split from Excel presets')} · {t('mode_' + mode.toLowerCase(), mode)} {t('mode_lowercase', 'mode')}
        </p>
        {[
          { dot: T.sky,     label: t('essentials_needs', 'Essentials / Needs'),                 pct: snap.presets.needs,     val: snap.budget.needs },
          { dot: T.rose,    label: t('emergency_safety_reserve', 'Emergency / Safety Reserve'), pct: snap.presets.emergency, val: snap.budget.emergency },
          { dot: T.goldMid, label: t('investments_total', 'Investments (Total)'),               pct: snap.presets.invest,    val: snap.budget.investments },
        ].map(r => (
          <div key={r.label} className="alloc-row">
            <div className="alloc-name"><div className="alloc-dot" style={{ background: r.dot }}/>{r.label}</div>
            <div className="alloc-right">
              <span className="alloc-pct">{Math.round(r.pct * 100)}%</span>
              <span className="alloc-amount">{fmt(r.val)}</span>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--gold-pale)', borderRadius: 12, border: '1px solid var(--gold-border)', fontSize: '.85rem', color: 'var(--text-muted)' }}>
          {t('milestone_requirement_desc', 'Active milestones require {val}/month of your essentials budget.').replace('{val}', fmt(mContribution))}
        </div>
      </Card>
    </div>
  );
}