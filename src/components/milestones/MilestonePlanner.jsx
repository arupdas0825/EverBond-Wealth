import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMilestoneStore } from '../../store/useMilestoneStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateMilestoneDetails } from '../../utils/milestoneEngine';
import { formatCurrency, formatCompact, formatDate } from '../../utils/finance';
import { 
  Plus, Calendar, Target, TrendingUp, AlertCircle, 
  ChevronRight, Trash2, Edit3, Heart, Wallet, 
  MapPin, Clock, Sparkles, CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';

// --- COMPONENTS ---

const MilestoneSummary = ({ milestones }) => {
  const { currency } = useFinanceStore();
  const stats = useMemo(() => {
    const totalTarget = milestones.reduce((sum, m) => sum + (Number(m.targetCost) || 0), 0);
    const totalMonthly = milestones.reduce((sum, m) => sum + (Number(m.monthlyContribution) || 0), 0);
    const atRisk = milestones.filter(m => calculateMilestoneDetails(m).isAtRisk).length;
    
    return { totalTarget, totalMonthly, atRisk, count: milestones.length };
  }, [milestones]);

  const fmt = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);

  return (
    <div className="stats-grid mb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card gold">
        <span className="stat-icon"><Sparkles size={24} color="var(--gold-mid)" /></span>
        <div className="stat-label">Total Future Assets</div>
        <div className="stat-value">{cmpct(stats.totalTarget)}</div>
        <div className="stat-sub">{stats.count} Active Milestones</div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card sage">
        <span className="stat-icon"><TrendingUp size={24} color="var(--sage)" /></span>
        <div className="stat-label">Monthly Commitment</div>
        <div className="stat-value">{fmt(stats.totalMonthly)}</div>
        <div className="stat-sub">Reserved from Income</div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card rose">
        <span className="stat-icon"><AlertCircle size={24} color="var(--rose)" /></span>
        <div className="stat-label">Milestones at Risk</div>
        <div className="stat-value">{stats.atRisk}</div>
        <div className="stat-sub">Needs attention</div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card sky">
        <span className="stat-icon"><Heart size={24} color="var(--sky)" /></span>
        <div className="stat-label">Shared Vision</div>
        <div className="stat-value">100%</div>
        <div className="stat-sub">Couple-synchronized</div>
      </motion.div>
    </div>
  );
};

const MilestoneCard = ({ milestone, onEdit, onDelete }) => {
  const { currency } = useFinanceStore();
  const details = calculateMilestoneDetails(milestone);
  const { 
    progressPercent, remainingAmount, monthlyNeeded, 
    isAtRisk, delayMonths, estimatedCompletionDate 
  } = details;

  const fmt = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);

  const targetDateStr = formatDate(milestone.targetDate);
  const estDateStr = formatDate(estimatedCompletionDate);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`milestone-card-premium ${isAtRisk ? 'at-risk' : ''}`}
    >
      <div className="ms-card-inner">
        <div className="ms-header">
          <div className="ms-icon-box">
            {milestone.category === 'Home' && <MapPin size={20} />}
            {milestone.category === 'Travel' && <Sparkles size={20} />}
            {milestone.category === 'Car' && <TrendingUp size={20} />}
            {milestone.category === 'Other' && <Target size={20} />}
          </div>
          <div className="ms-title-area">
            <div className="ms-category">{milestone.category}</div>
            <h3 className="ms-name">{milestone.name}</h3>
          </div>
          <div className="ms-actions">
            <button onClick={() => onEdit(milestone)} className="ms-btn-icon"><Edit3 size={16} /></button>
            <button onClick={() => onDelete(milestone.id)} className="ms-btn-icon trash"><Trash2 size={16} /></button>
          </div>
        </div>

        <div className="ms-main-stats">
          <div className="ms-stat-item">
            <div className="ms-stat-label">Target Cost</div>
            <div className="ms-stat-value">{cmpct(Number(milestone.targetCost))}</div>
          </div>
          <div className="ms-stat-item">
            <div className="ms-stat-label">Target Date</div>
            <div className="ms-stat-value">{targetDateStr}</div>
          </div>
        </div>

        <div className="ms-progress-area">
          <div className="ms-progress-info">
            <span>Progress</span>
            <span className="ms-progress-pct">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="ms-progress-track">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="ms-progress-fill" 
            />
          </div>
        </div>

        <div className="ms-footer">
          <div className="ms-contribution">
            <Wallet size={14} />
            <span>{fmt(Number(milestone.monthlyContribution))}/mo</span>
          </div>
          {isAtRisk ? (
            <div className="ms-insight risk">
              <AlertCircle size={14} />
              <span>Delayed by {delayMonths}mo ({estDateStr})</span>
            </div>
          ) : (
            <div className="ms-insight safe">
              <CheckCircle2 size={14} />
              <span>On Track</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual background element */}
      <div className="ms-card-glow" />
    </motion.div>
  );
};

const MilestoneForm = ({ milestone, onSave, onCancel }) => {
  const [formData, setFormData] = useState(milestone || {
    name: '',
    category: 'Home',
    targetCost: '',
    targetDate: '',
    priority: 'Medium',
    description: '',
    monthlyContribution: '',
    currentSavings: 0
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetCost || !formData.targetDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const year = new Date(formData.targetDate).getFullYear();
    if (year < 2026) {
      setError('Milestones must be set for 2026 or later.');
      return;
    }

    onSave(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card mb-32"
    >
      <div className="card-title">Define Your Future Asset</div>
      <h2 className="card-heading mb-24">{milestone ? 'Edit Milestone' : 'Create New Milestone'}</h2>
      
      <form onSubmit={handleSubmit} className="ms-form">
        <div className="form-grid-2 mb-20">
          <div className="form-group">
            <label className="form-label">Asset Name</label>
            <input 
              className="eb-input" 
              placeholder="e.g. Dream Apartment" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="eb-select"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option>Home</option>
              <option>Car</option>
              <option>Travel</option>
              <option>Wedding</option>
              <option>Electronics</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="form-grid-2 mb-20">
          <div className="form-group">
            <label className="form-label">Target Cost (₹)</label>
            <input 
              type="number" 
              className="eb-input" 
              placeholder="Total amount needed" 
              value={formData.targetCost}
              onChange={e => setFormData({...formData, targetCost: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Purchase Date</label>
            <input 
              type="date" 
              className={`eb-input premium-date ${error.includes('2026') ? 'input-error' : ''}`}
              min="2026-01-01"
              value={formData.targetDate}
              onChange={e => {
                setFormData({...formData, targetDate: e.target.value});
                setError('');
              }}
            />
            <div className="ms-date-hint">Format: DD-MM-YYYY (Min: 2026)</div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ms-error-msg"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="form-grid-2 mb-24">
          <div className="form-group">
            <label className="form-label">Monthly Contribution (₹)</label>
            <input 
              type="number" 
              className="eb-input" 
              placeholder="How much to save monthly?" 
              value={formData.monthlyContribution}
              onChange={e => setFormData({...formData, monthlyContribution: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select 
              className="eb-select"
              value={formData.priority}
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Essential</option>
            </select>
          </div>
        </div>

        <div className="ms-form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>
            {milestone ? 'Update Milestone' : 'Launch Milestone'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// --- MAIN PAGE ---

export function MilestonePlanner() {
  const { currency } = useFinanceStore();
  const { milestones, addMilestone, updateMilestone, deleteMilestone } = useMilestoneStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const fmt = a => formatCurrency(a, currency);
  const cmpct = a => formatCompact(a, currency);

  const handleSave = (data) => {
    if (editingMilestone) {
      updateMilestone(editingMilestone.id, data);
    } else {
      addMilestone(data);
    }
    setShowForm(false);
    setEditingMilestone(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this milestone? This cannot be undone.')) {
      deleteMilestone(id);
    }
  };

  // Prepare chart data: Cumulative savings for all milestones
  const chartData = useMemo(() => {
    if (milestones.length === 0) return [];
    
    // Simple projection for next 36 months
    const data = [];
    const today = new Date();
    for (let i = 0; i <= 36; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const totalMonthly = milestones.reduce((sum, m) => sum + (Number(m.monthlyContribution) || 0), 0);
      data.push({
        month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        savings: totalMonthly * i
      });
    }
    return data;
  }, [milestones]);

  return (
    <div className="fade-in">
      <header className="page-header">
        <div className="page-eyebrow">Asset Planning Engine</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 className="page-title">Milestone Planner</h1>
            <p className="page-desc">
              Design your future life together. Plan major purchases, track timelines, 
              and visualize your journey toward shared assets.
            </p>
          </div>
          {!showForm && (
            <button className="btn-primary" onClick={() => setShowForm(true)} style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} /> New Milestone
            </button>
          )}
        </div>
      </header>

      <MilestoneSummary milestones={milestones} />

      <AnimatePresence mode="wait">
        {(showForm || editingMilestone) && (
          <MilestoneForm 
            milestone={editingMilestone}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingMilestone(null); }}
          />
        )}
      </AnimatePresence>

      <div className="grid-2 mb-32">
        <div className="card">
          <div className="card-title">Accumulated Future Wealth</div>
          <h3 className="card-heading">3-Year Growth Projection</h3>
          <p className="card-sub">Total savings allocated specifically for your planned milestones.</p>
          
          <div className="chart-wrap-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold-mid)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--gold-mid)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--text-faint)' }} 
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: 'var(--sh-md)',
                    fontFamily: 'var(--fb)'
                  }}
                  formatter={(val) => [fmt(val), 'Projected Assets']}
                />
                <Area 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="var(--gold-mid)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSavings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Timeline Overview</div>
          <h3 className="card-heading">Upcoming Milestones</h3>
          <p className="card-sub">Sequential roadmap of your life goals.</p>
          
          <div className="ms-timeline-list">
            {milestones.length === 0 ? (
              <div className="ms-empty-state">
                <Calendar size={48} color="var(--border-str)" />
                <p>No milestones planned yet.</p>
              </div>
            ) : (
              [...milestones]
                .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
                .map((m, idx) => {
                  const details = calculateMilestoneDetails(m);
                  return (
                    <div key={m.id} className="ms-timeline-row">
                      <div className="ms-tl-date-wide">
                        <div className="ms-tl-date-formatted">{formatDate(m.targetDate)}</div>
                      </div>
                      <div className="ms-tl-line">
                        <div className="ms-tl-dot" style={{ backgroundColor: details.isAtRisk ? 'var(--rose)' : 'var(--sage)' }} />
                      </div>
                      <div className="ms-tl-content">
                        <div className="ms-tl-name">{m.name}</div>
                        <div className="ms-tl-price">{cmpct(Number(m.targetCost))}</div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      <div className="card-title mb-16">Active Milestones</div>
      <div className="ms-grid">
        <AnimatePresence>
          {milestones.map(m => (
            <MilestoneCard 
              key={m.id} 
              milestone={m} 
              onEdit={setEditingMilestone}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
        
        {milestones.length === 0 && !showForm && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="ms-add-card"
            onClick={() => setShowForm(true)}
          >
            <div className="ms-add-icon"><Plus size={32} /></div>
            <div className="ms-add-text">Add your first milestone</div>
          </motion.button>
        )}
      </div>
    </div>
  );
}
