import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';

export function ActivityFeed({ limit }) {
  const { workspaceActivities } = useFinanceStore();

  const activities = limit ? workspaceActivities.slice(0, limit) : workspaceActivities;

  if (activities.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
        No recent activity.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {activities.map((activity, index) => (
        <div key={activity.id} style={{ display: 'flex', gap: 12, position: 'relative' }}>
          {index !== activities.length - 1 && (
            <div style={{ position: 'absolute', left: 4, top: 16, bottom: -16, width: 2, background: 'var(--border)' }} />
          )}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.rose, marginTop: 4, flexShrink: 0, position: 'relative', zIndex: 2 }} />
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              <span style={{ fontWeight: 600 }}>{activity.user}</span> {activity.action} <span style={{ fontWeight: 600 }}>{activity.target}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: 2 }}>
              {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
