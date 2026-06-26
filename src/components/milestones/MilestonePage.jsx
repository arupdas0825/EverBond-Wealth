import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { 
  parseMilestoneDate, 
  requiredMonthlySaving, 
  progressPercent, 
  formatCountdown,
  totalMilestoneContribution
} from '../../utils/milestones';
import { formatCurrency, formatCompact } from '../../utils/finance';
import { T } from '../../theme/tokens';
import { useTranslation } from '../../utils/i18n';
import { Logo } from '../common/Logo';

const CATEGORIES = [
  { id: 'car',       label: 'Car / Vehicle', icon: '🚗', color: '#B8902A' }, // gold
  { id: 'house',     label: 'House / Property', icon: '🏠', color: '#4A8CC4' }, // sky
  { id: 'travel',    label: 'Travel / Trip', icon: '✈️', color: '#D9667A' }, // rose
  { id: 'gadget',    label: 'Gadget / Tech', icon: '💻', color: '#2D9C82' }, // emerald (custom)
  { id: 'furniture', label: 'Furniture', icon: '🛋️', color: '#7C6BBE' }, // violet
  { id: 'wedding',   label: 'Wedding', icon: '💍', color: '#D99C3B' }, // amber (custom)
  { id: 'education', label: 'Education', icon: '🎓', color: '#4E9B78' }, // sage
  { id: 'other',     label: 'Other', icon: '🏁', color: '#6B6455' }, // muted
];

function StableNumericInput({ value, onCommit, placeholder, className, style }) {
  const [localValue, setLocalValue] = useState(value || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) setLocalValue(value || '');
  }, [value, isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    const num = parseFloat(localValue);
    onCommit(isNaN(num) ? 0 : num);
  };

  return (
    <input
      type="number"
      className={className}
      style={style}
      placeholder={placeholder}
      value={localValue}
      onFocus={() => setIsEditing(true)}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      inputMode="decimal"
    />
  );
}

export function MilestonePage() {
  const { milestones, addMilestone, updateMilestone, removeMilestone, currency, stage } = useFinanceStore();
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const formRef = useRef(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('car');
  const [newTargetCost, setNewTargetCost] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [formError, setFormError] = useState('');

  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      const dateA = parseMilestoneDate(a.targetDate);
      const dateB = parseMilestoneDate(b.targetDate);
      return dateA - dateB;
    });
  }, [milestones]);

  const totalMonthly = totalMilestoneContribution(milestones);
  const totalCost = milestones.reduce((sum, m) => sum + m.targetCost, 0);

  const fmt = (a) => formatCurrency(a, currency);
  const cmpct = (a) => formatCompact(a, currency);

  const handleAdd = () => {
    if (!newName) return setFormError(t('enter_name_error', 'Please enter a name'));
    if (!newTargetCost || parseFloat(newTargetCost) <= 0) return setFormError(t('target_cost_error', 'Target cost must be > 0'));
    if (!/^\d{2}-\d{2}-\d{4}$/.test(newTargetDate)) return setFormError(t('date_format_error', 'Date must be DD-MM-YYYY'));
    
    const [d, m, y] = newTargetDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime()) || dateObj.getDate() !== d || dateObj.getMonth() !== m - 1) {
      return setFormError(t('invalid_date_error', 'Invalid calendar date'));
    }
    if (y < 2026) return setFormError(t('year_error', 'Year must be 2026 or later'));
    
    const today = new Date();
    if (dateObj <= today) return setFormError(t('future_date_error', 'Target date must be in the future'));

    addMilestone({
      name: newName,
      category: newCategory,
      targetCost: parseFloat(newTargetCost),
      targetDate: newTargetDate,
      monthlySaved: 0,
      notes: ''
    });

    // Reset Form
    setNewName('');
    setNewCategory('car');
    setNewTargetCost('');
    setNewTargetDate('');
    setFormError('');
    setShowAddForm(false);
  };

  useEffect(() => {
    if (showAddForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showAddForm]);

  return (
    <div className="fade-in">
      <div className="eb-page-header">
        <div className="eb-page-header-left">
          <div className="eb-logo-glass-card">
            <Logo size={32} showText={false} />
          </div>
        </div>
        <div className="eb-page-header-right" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div className="page-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t('milestone_planner', 'Milestone Planner')}</span>
            </div>
            <h1 className="page-title">{stage === 'Single' ? t('solo', 'Solo') : t('shared', 'Shared')} <em>{t('milestones', 'Milestones')}</em></h1>
            <p className="page-desc">{stage === 'Single' ? t('solo_milestones_desc', 'Plan future purchases. Linear savings for major dreams.') : t('shared_milestones_desc', 'Plan future purchases together. Linear savings for major dreams.')}</p>
          </div>
          <div style={{
            background: 'var(--gold-pale)', padding: '12px 20px', borderRadius: '18px',
            border: '1px solid var(--gold-border)', textAlign: 'right', flexShrink: 0
          }}>
            <div className="stat-label" style={{ marginBottom: 2 }}>{t('monthly_contribution', 'Monthly Contribution')}</div>
            <div style={{ fontFamily: 'var(--fd)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)' }}>
              {fmt(totalMonthly)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3 mb-32">
        <div className="stat-card">
          <div className="stat-label">{t('active_goals', 'Active Goals')}</div>
          <div className="stat-value">{milestones.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('total_target', 'Total Target')}</div>
          <div className="stat-value">{cmpct(totalCost)}</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">{t('monthly_required', 'Monthly Required')}</div>
          <div className="stat-value">{fmt(totalMonthly)}</div>
        </div>
      </div>

      <div className="ms-grid">
        {sortedMilestones.map(m => {
          const cat = CATEGORIES.find(c => c.id === m.category) || CATEGORIES[7];
          const monthlyReq = requiredMonthlySaving(m.targetCost, m.monthlySaved, m.targetDate);
          const progress = progressPercent(m.monthlySaved, m.targetCost);
          const isAchieved = m.monthlySaved >= m.targetCost;

          return (
            <div key={m.id} className={`goal-card ${isAchieved ? 'achieved' : ''}`} style={{ borderTop: `4px solid ${cat.color}` }}>
              {/* Header */}
              <div className="goal-header">
                <div>
                  <div className="goal-icon">{cat.icon}</div>
                  <div className="goal-name">{m.name}</div>
                  <div className="goal-tag">{t('cat_' + cat.id, cat.label)}</div>
                </div>
                {isAchieved ? (
                  <div style={{ background: 'var(--sage-lt)', color: 'var(--sage)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {t('achieved', 'Achieved')}
                  </div>
                ) : (
                  <div style={{ textAlign: 'right' }}>
                    <div className="goal-monthly-amount" style={{ color: 'var(--gold)' }}>{fmt(monthlyReq)}</div>
                    <div className="goal-eta">{t('in_countdown', 'in {countdown}').replace('{countdown}', formatCountdown(m.targetDate))}</div>
                  </div>
                )}
              </div>

              <div className="goal-target-row">
                <span className="goal-target-label">{t('target', 'Target')}</span>
                <span className="goal-target-val">{fmt(m.targetCost)} <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontWeight: 500 }}>{t('by_date', 'by')} {m.targetDate}</span></span>
              </div>

              <div className="divider" style={{ margin: '12px 0' }} />

              <div className="goal-target-row" style={{ marginBottom: 6 }}>
                <span className="goal-target-label">{t('saved_so_far', 'Saved so far')}</span>
                <span className="goal-target-val" style={{ color: cat.color }}>{fmt(m.monthlySaved)}</span>
              </div>

              <StableNumericInput
                className="goal-input"
                value={m.monthlySaved}
                onCommit={(v) => updateMilestone(m.id, { monthlySaved: v })}
                placeholder={t('update_saved_amount', 'Update saved amount...')}
              />

              <div className="progress-track" style={{ height: 8 }}>
                <div className="progress-fill" style={{ 
                  width: `${progress}%`, 
                  background: isAchieved ? 'var(--sage)' : cat.color 
                }} />
              </div>

              <div className="goal-projection" style={{ marginBottom: 12 }}>
                <span>{t('progress_saved', '{pct}% saved').replace('{pct}', progress.toFixed(0))}</span>
                <span>{t('remaining_amount', '{amount} remaining').replace('{amount}', fmt(Math.max(0, m.targetCost - m.monthlySaved)))}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="btn-reset" 
                  style={{ width: 'auto', padding: '4px 8px' }}
                  onClick={() => {
                    if (window.confirm(t('confirm_remove_milestone', 'Remove milestone "{name}"?').replace('{name}', m.name))) removeMilestone(m.id);
                  }}
                  aria-label={`Remove ${m.name}`}
                >
                  ✕ {t('remove', 'Remove')}
                </button>
                {m.notes && <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--text-faint)' }}>{m.notes}</div>}
              </div>
            </div>
          );
        })}

        {/* Add Milestone Placeholder / Button */}
        {!showAddForm ? (
          <div className="ms-add-card" style={{ height: '100%', minHeight: '380px' }} onClick={() => setShowAddForm(true)}>
            <div className="ms-add-icon" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>＋</div>
            <div className="ms-add-text">{t('add_milestone', 'Add Milestone')}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 8 }}>{t('set_new_shared_target', 'Set a new shared target')}</div>
          </div>
        ) : (
          <div className="card" ref={formRef} style={{ 
            border: '2px solid var(--gold-border)', 
            background: 'linear-gradient(165deg, var(--bg-card) 0%, var(--gold-pale) 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="card-title" style={{ marginBottom: 0 }}>{t('new_milestone', 'New Milestone')}</div>
              <button className="btn-reset" style={{ width: 'auto', padding: '4px 8px' }} onClick={() => setShowAddForm(false)}>✕ {t('close', 'Close')}</button>
            </div>
            
            <div className="form-group mb-12">
              <label className="form-label">{t('goal_name', 'Goal Name')}</label>
              <input 
                className="eb-input" 
                style={{ padding: '10px 12px' }}
                placeholder="e.g. Europe Trip 2027" 
                value={newName}
                onChange={e => setNewName(e.target.value.slice(0, 60))}
              />
            </div>

            <div className="form-group mb-12">
              <label className="form-label">{t('category', 'Category')}</label>
              <select className="eb-select" style={{ padding: '10px 12px' }} value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {t('cat_' + c.id, c.label)}</option>)}
              </select>
            </div>

            <div className="form-grid-2 mb-12" style={{ gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">{t('target_date', 'Target Date')}</label>
                <input 
                  className="eb-input" 
                  style={{ padding: '9px 12px', cursor: 'pointer' }}
                  type="date"
                  min="2026-01-01"
                  value={(() => {
                    if (!newTargetDate || !/^\d{2}-\d{2}-\d{4}$/.test(newTargetDate)) return '';
                    const [d, m, y] = newTargetDate.split('-');
                    return `${y}-${m}-${d}`;
                  })()}
                  onChange={e => {
                    const iso = e.target.value;
                    if (!iso) return setNewTargetDate('');
                    const [y, m, d] = iso.split('-');
                    setNewTargetDate(`${d}-${m}-${y}`);
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('target_currency', 'Target ({currency})').replace('{currency}', currency)}</label>
                <input 
                  className="eb-input" 
                  style={{ padding: '10px 12px' }}
                  type="number" 
                  placeholder={t('amount_placeholder', 'Amount...')} 
                  value={newTargetCost}
                  onChange={e => setNewTargetCost(e.target.value)}
                  inputMode="decimal"
                />
              </div>
            </div>
            
            <div style={{ flex: 1 }}></div>

            {formError && (
              <div style={{ color: 'var(--rose)', fontSize: '0.7rem', fontWeight: 700, marginBottom: 10, background: 'var(--rose-lt)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--rose-border)' }}>
                {formError}
              </div>
            )}

            <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: 0 }} onClick={handleAdd}>{t('create_milestone', 'Create Milestone')}</button>
          </div>
        )}
      </div>

      {milestones.length === 0 && !showAddForm && (
        <div className="ms-empty-state">
          <div style={{ fontSize: '3rem', opacity: 0.3 }}>🏁</div>
          <div style={{ fontWeight: 600 }}>{t('no_milestones_yet', 'No milestones yet — plan your first shared goal')}</div>
          <button className="btn-primary" style={{ width: 'auto', marginTop: 10 }} onClick={() => setShowAddForm(true)}>
            {t('start_planning', 'Start Planning')}
          </button>
        </div>
      )}
    </div>
  );
}
