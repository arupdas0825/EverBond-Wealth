import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { auth } from '../../utils/firebase';
import { useTranslation } from '../../utils/i18n';
import { 
  Sun, Moon, Laptop, Bell, Shield, Lock, Smartphone, LaptopIcon, 
  Trash2, FileText, ChevronRight, Eye, RefreshCw, Key, Globe, EyeOff,
  ShieldCheck, Database
} from 'lucide-react';

export function SettingsPage({ setActivePolicyDoc, setPage }) {
  const store = useFinanceStore();
  const toast = useToast();
  const { theme, setTheme, reset } = store;
  const { t } = useTranslation();

  // Notification states
  const [pushNotif, setPushNotif] = useState(true);
  const [coupleNotif, setCoupleNotif] = useState(true);
  const [goalNotif, setGoalNotif] = useState(true);
  const [milestoneAlerts, setMilestoneAlerts] = useState(true);

  // Privacy states
  const [dataVisibility, setDataVisibility] = useState('shared'); // 'public' | 'shared' | 'private'
  const [sharingPermissions, setSharingPermissions] = useState(true);

  // Security session management simulation
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'Chrome on Windows (10.0.1)', location: 'Mumbai, India', status: 'active', time: 'Active Now', icon: <Laptop size={18} /> },
    { id: 'sess-2', device: 'Safari on iPhone 15 Pro', location: 'Mumbai, India', status: 'idle', time: '2 hours ago', icon: <Smartphone size={18} /> }
  ]);

  const handleRevokeSession = (id, device) => {
    setSessions(sessions.filter(s => s.id !== id));
    toast.success(`${t('session_revoked', 'Session for {device} revoked.').replace('{device}', device)}`);
  };

  const handleThemeChange = (mode) => {
    setTheme(mode);
    toast.success(`${t('theme_set_success', 'Theme set to {mode} mode.').replace('{mode}', mode.toUpperCase())}`);
  };

  const handleExportData = () => {
    try {
      const rawData = localStorage.getItem('eb_v6');
      if (!rawData) {
        toast.error(t('no_local_data', "No local data found to export."));
        return;
      }
      const dataObj = JSON.parse(rawData);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "everbond_financial_export.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(t('data_exported_success', "Financial ledger exported successfully."));
    } catch (err) {
      toast.error(t('export_failed', "Failed to export data: ") + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmWipe = window.confirm(t('confirm_delete_account', "Are you absolutely sure you want to delete your EverBond Account? This will permanently delete your Firestore database document, delete your login profile, and wipe all local storage. This action is irreversible."));
    if (!confirmWipe) return;

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const { deleteUserAccountAndData } = await import('../../utils/firebase');
        await deleteUserAccountAndData(currentUser);
      }
      
      reset();
      localStorage.removeItem('eb_v6');
      
      toast.success(t('account_deleted_success', "Account and data deleted successfully."));
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("Account deletion failed:", err);
      toast.error(`${t('account_delete_failed', 'Account deletion failed: {error}. Please re-authenticate and try again.').replace('{error}', err.message)}`);
    }
  };

  // Browser telemetry mock
  const [deviceInfo, setDeviceInfo] = useState({
    os: 'Windows 11',
    browser: 'Chrome 122.0.0',
    ip: '192.168.1.42',
    network: 'Encrypted Node (TLS 1.3)'
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="page-eyebrow">{t('platform_calibration', 'Platform Calibration')}</div>
          <h1 className="page-title">{t('platform', 'Platform')} <em>{t('settings', 'Settings')}</em></h1>
          <p className="page-desc">{t('settings_desc', 'Configure visual theme engines, notification centers, data privacy, and session keys.')}</p>
        </div>
      </div>

      {/* Bento Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="eb-settings-grid"
      >
        {/* APPEARANCE */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '16px' }}>{t('appearance_mode', 'Appearance Mode')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 12px' }}>{t('theme_configuration', 'Theme Configuration')}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{t('theme_desc', 'Choose a theme or adapt to your system color scheme automatically.')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button 
                onClick={() => handleThemeChange('light')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px',
                  borderRadius: '12px', border: `1.5px solid ${theme === 'light' ? T.gold : 'var(--border)'}`,
                  background: theme === 'light' ? 'var(--gold-pale)' : 'transparent',
                  color: theme === 'light' ? T.gold : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s ease'
                }}
              >
                <Sun size={18} />
                <span>{t('light', 'Light')}</span>
              </button>

              <button 
                onClick={() => handleThemeChange('dark')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px',
                  borderRadius: '12px', border: `1.5px solid ${theme === 'dark' ? T.gold : 'var(--border)'}`,
                  background: theme === 'dark' ? 'var(--gold-pale)' : 'transparent',
                  color: theme === 'dark' ? T.gold : 'var(--text-muted)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s ease'
                }}
              >
                <Moon size={18} />
                <span>{t('dark', 'Dark')}</span>
              </button>

              <button 
                onClick={() => handleThemeChange('dark')} // Auto theme mock
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px',
                  borderRadius: '12px', border: '1.5px solid var(--border)',
                  background: 'transparent', color: 'var(--text-faint)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s ease'
                }}
              >
                <Laptop size={18} />
                <span>{t('auto', 'Auto')}</span>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* NOTIFICATIONS */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '16px' }}>{t('notification_center', 'Notification Center')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>{t('alert_channels', 'Alert Channels')}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: t('push_notifications', 'Push Notifications'), desc: t('push_desc', 'Alerts on browser window status'), state: pushNotif, setter: setPushNotif },
                { label: t('couple_notifications', 'Couple Notifications'), desc: t('couple_notif_desc', 'Sync events and partner changes'), state: coupleNotif, setter: setCoupleNotif },
                { label: t('goal_notifications', 'Goal Notifications'), desc: t('goal_notif_desc', 'Target reach rates and alerts'), state: goalNotif, setter: setGoalNotif },
                { label: t('milestone_alerts', 'Milestone Alerts'), desc: t('milestone_notif_desc', 'Milestone updates and targets'), state: milestoneAlerts, setter: setMilestoneAlerts }
              ].map((notif, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{notif.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{notif.desc}</div>
                  </div>
                  
                  {/* Framer motion Toggle switch */}
                  <div 
                    onClick={() => notif.setter(!notif.state)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '100px',
                      background: notif.state ? T.gold : 'var(--bg-muted)',
                      padding: '2px', display: 'flex', alignItems: 'center',
                      justifyContent: notif.state ? 'flex-end' : 'flex-start',
                      cursor: 'pointer', transition: 'background-color 0.2s ease'
                    }}
                  >
                    <motion.div 
                      layout
                      style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* PRIVACY */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '16px' }}>{t('data_visibility', 'Data Visibility')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>{t('privacy_parameters', 'Privacy Parameters')}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                  <span>{t('ecosystem_privacy_node', 'Ecosystem Privacy Node')}</span>
                  <span style={{ color: T.gold, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    {dataVisibility === 'shared' ? t('shared_ledger', 'Shared Ledger') : dataVisibility === 'private' ? t('private_node', 'Private Node') : t('public_label', 'Public')}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'public', label: t('public_label', 'Public'), icon: <Globe size={14} /> },
                    { id: 'shared', label: t('shared_ledger', 'Shared'), icon: <Eye size={14} /> },
                    { id: 'private', label: t('private_node', 'Private'), icon: <EyeOff size={14} /> }
                  ].map(v => (
                    <button
                      key={v.id}
                      onClick={() => setDataVisibility(v.id)}
                      style={{
                        padding: '10px 8px', borderRadius: '10px', fontSize: '0.78rem',
                        border: `1px solid ${dataVisibility === v.id ? T.gold : 'var(--border-mid)'}`,
                        background: dataVisibility === v.id ? 'var(--gold-pale)' : 'transparent',
                        color: dataVisibility === v.id ? T.gold : 'var(--text-muted)',
                        cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {v.icon}
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-mid)', paddingTop: '14px', marginTop: '4px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{t('couple_sharing_permissions', 'Couple Sharing Permissions')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{t('couple_sharing_desc', 'Allow partner to query allocation history')}</div>
                </div>
                <div 
                  onClick={() => setSharingPermissions(!sharingPermissions)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '100px',
                    background: sharingPermissions ? T.gold : 'var(--bg-muted)',
                    padding: '2px', display: 'flex', alignItems: 'center',
                    justifyContent: sharingPermissions ? 'flex-end' : 'flex-start',
                    cursor: 'pointer', transition: 'background-color 0.2s ease'
                  }}
                >
                  <motion.div 
                    layout
                    style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SECURITY & DEVICE INFO */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '16px' }}>{t('device_telemetry', 'Device telemetry')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>{t('security_encryption', 'Security & Encryption')}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-warm)', borderRadius: T.radiusSm, padding: '14px', border: '1px solid var(--border-mid)' }}>
              <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>{t('host_os', 'Host OS:')}</span>
                <strong style={{ color: 'var(--text)' }}>{deviceInfo.os}</strong>
              </div>
              <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>{t('host_browser', 'Host browser:')}</span>
                <strong style={{ color: 'var(--text)' }}>{deviceInfo.browser}</strong>
              </div>
              <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-faint)' }}>{t('node_ip', 'Node IP:')}</span>
                <strong style={{ color: 'var(--text)' }}>{deviceInfo.ip}</strong>
              </div>
              <div style={{ display: 'flex', justify: 'space-between', fontSize: '0.78rem', borderTop: '1px dashed var(--border-mid)', paddingTop: '6px', marginTop: '2px' }}>
                <span style={{ color: 'var(--text-faint)' }}>{t('encryption', 'Encryption:')}</span>
                <strong style={{ color: T.sage }}>{deviceInfo.network}</strong>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SESSION MANAGEMENT */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '16px' }}>{t('sovereign_ledger', 'Sovereign ledger')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 16px' }}>{t('active_sessions', 'Active Sessions')}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sessions.map(sess => (
                <div key={sess.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-warm)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ color: T.gold }}>{sess.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)' }}>{sess.device}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>{sess.location} · {sess.time}</div>
                    </div>
                  </div>
                  
                  {sess.status !== 'active' && (
                    <button
                      onClick={() => handleRevokeSession(sess.id, sess.device)}
                      style={{
                        padding: '4px 10px', fontSize: '0.7rem', color: T.rose,
                        border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700
                      }}
                    >
                      {t('revoke', 'Revoke')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* DOCUMENTATION PANEL */}
        <motion.div variants={itemVariants} className="span-6">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justify: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '16px' }}>{t('resources', 'Resources')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{t('manuals_apis', 'User Manuals & APIs')}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{t('documentation_settings_desc', 'Open our scrollable document center to learn about relationship models, trust locks, and investment compounding curves.')}</p>
            </div>

            <button
              onClick={() => setPage('documentation')}
              className="btn-primary"
              style={{
                background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
                boxShadow: 'var(--sh-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', width: '100%', borderRadius: '12px'
              }}
            >
              <FileText size={16} /> {t('open_documentation', 'Open Platform Documentation')} <ChevronRight size={16} />
            </button>
          </Card>
        </motion.div>

        {/* DATA SOVEREIGNTY & TRUST */}
        <motion.div variants={itemVariants} className="span-12">
          <Card style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-mid)',
            borderRadius: '18px',
            padding: '28px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.gold, display: 'block', marginBottom: '8px' }}>
                  {t('data_belongs_to_you', 'Your Data Belongs To You')}
                </span>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
                  {t('data_sovereignty_title', 'Data Sovereignty & Privacy Controls')}
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {t('data_sovereignty_desc', 'At EverBond Wealth, we believe your financial numbers are sacred. We protect your data using enterprise-grade encryption and give you full control over your privacy records, including exporting or permanently purging your records at any time.')}
                </p>
              </div>

              {/* Security Badges Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
                gap: '12px' 
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', background: 'var(--bg-warm)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: T.gold }}><Lock size={20} /></div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{t('aes_encryption', 'AES-256 Encryption')}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>{t('client_caching', 'Secure client-side caching')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', background: 'var(--bg-warm)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: T.sage }}><Shield size={20} /></div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{t('firebase_auth', 'Firebase Auth')}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>{t('identity_tokens', 'Federated identity tokens')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px', background: 'var(--bg-warm)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ color: T.sky }}><Database size={20} /></div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{t('secure_cloud', 'Secure Cloud')}</div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>{t('encrypted_infra', 'Encrypted infrastructure')}</div>
                  </div>
                </div>
              </div>

              {/* Trust Buttons Panel */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: '16px',
                borderTop: '1px solid var(--border)',
                paddingTop: '20px'
              }}>
                <div>
                  <button 
                    onClick={() => setActivePolicyDoc('data-handling')}
                    style={{ background: 'none', border: 'none', padding: 0, color: T.gold, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {t('view_accessed_details', 'View google profiles accessed details >')}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleExportData}
                    style={{
                      padding: '10px 20px',
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border-mid)',
                      borderRadius: '10px',
                      color: 'var(--text)',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                  >
                    {t('export_my_data', 'Export My Data')}
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(217, 102, 122, 0.1)',
                      border: '1px solid rgba(217, 102, 122, 0.25)',
                      borderRadius: '10px',
                      color: T.rose,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.rose}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(217, 102, 122, 0.1)'}
                  >
                    {t('delete_account_and_data', 'Delete Account & Data')}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* DANGER ZONE */}
        <motion.div variants={itemVariants} className="span-12">
          <Card style={{ border: '1px solid rgba(217, 102, 122, 0.25)', background: 'linear-gradient(135deg, rgba(217, 102, 122, 0.02) 0%, rgba(217, 102, 122, 0.0) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.rose, display: 'block', marginBottom: '14px' }}>{t('danger_zone', 'Danger Zone')}</span>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>{t('reset_platform_core', 'Reset Platform Core')}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>{t('wipe_database_desc', 'Wipe all local ledger files, target indices, milestones, notes, and partner handshakes. This action is irreversible.')}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  const resetConfirm = window.confirm(t('confirm_wipe_db', "Are you absolutely sure you want to reset the entire database? This will clear all allocations, notes, and profile settings."));
                  if (resetConfirm) {
                    reset();
                    localStorage.removeItem('eb_v6');
                    toast.success(t('db_wiped_success', "Database fully wiped. Reloading..."));
                    setTimeout(() => window.location.reload(), 1500);
                  }
                }}
                className="btn-reset"
                style={{
                  width: 'auto', padding: '10px 24px', background: T.rose, color: '#fff',
                  border: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                  fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(217, 102, 122, 0.25)'
                }}
              >
                <Trash2 size={16} /> {t('wipe_database_btn', 'Wipe Sovereign Database')}
              </button>
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
