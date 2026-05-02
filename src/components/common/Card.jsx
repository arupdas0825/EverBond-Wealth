import React from 'react';

export function Card({ title, subtitle, children, className = "", gold = false }) {
  return (
    <div className={`card ${gold ? 'card-gold' : ''} ${className}`}>
      {title && <div className="card-title">{title}</div>}
      {subtitle && <div className="card-subtitle">{subtitle}</div>}
      {children}
    </div>
  );
}

export function StatCard({ cls, icon, label, value, sub }) {
  return (
    <div className={`stat-card ${cls}`}>
      <span className="stat-icon">{icon}</span>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
