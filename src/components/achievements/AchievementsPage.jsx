import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getXPForNextLevel } from '../../constants/achievements';
import { Badge } from './Badge';

export const AchievementsPage = () => {
  const { achievements, userLevel, totalXP } = useFinanceStore();
  
  const xpForNextLevel = getXPForNextLevel(totalXP);
  
  // Calculate a smooth percentage for the progress bar
  // Base it off of 0 to nextLevel for simplicity
  const progressPercent = Math.min(100, (totalXP / xpForNextLevel) * 100);

  const unlockedIds = new Set(achievements.map(a => a.id));

  const categories = Object.values(ACHIEVEMENT_CATEGORIES);

  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))' }}>🏆</span> 
            Journey Rewards
          </h1>
          <p className="page-subtitle">Track your wealth building milestones and elite achievements.</p>
        </div>
      </header>

      {/* Level & XP Header */}
      <section className="glass-card" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--gold)', boxShadow: '0 8px 32px rgba(212, 175, 55, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.75rem', fontWeight: 600 }}>Level {userLevel}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Wealth Architect</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 500 }}>
              {totalXP} <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>/ {xpForNextLevel} XP</span>
            </h3>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--gold), #f9e596)',
              boxShadow: '0 0 10px rgba(212,175,55,0.8)'
            }}
          />
        </div>
      </section>

      {/* Badges Grid by Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
        {categories.map((category, index) => {
          const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category);
          if (categoryAchievements.length === 0) return null;

          const unlockedCount = categoryAchievements.filter(a => unlockedIds.has(a.id)).length;

          return (
            <motion.section 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid var(--border)', 
                paddingBottom: '0.5rem', 
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {category}
                </h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {unlockedCount} / {categoryAchievements.length} Unlocked
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem'
              }}>
                {categoryAchievements.map(achievement => (
                  <Badge 
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={unlockedIds.has(achievement.id)}
                  />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.div>
  );
};
