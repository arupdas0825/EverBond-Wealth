import React from 'react';
import { T } from '../../theme/tokens';

export function Card({ children, className = '', gold = false, style = {}, onClick }) {
  return (
    <div
      className={`card ${gold ? 'card-gold' : ''} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({ cls = '', icon, label, value, sub }) {
  return (
    <div className={`stat-card ${cls}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}