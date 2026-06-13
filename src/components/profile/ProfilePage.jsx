import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { ProfileEditModal } from './ProfileEditModal';
import { useTranslation } from '../../utils/i18n';
import { 
  User, Shield, MapPin, DollarSign, Calendar, Edit3, 
  Mail, Globe, Clock, Laptop, Check, Lock, Smartphone, 
  Activity, Users, Crown, ShieldCheck, Heart 
} from 'lucide-react';
import { db } from '../../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function ProfilePage() {
  const store = useFinanceStore();
  const { t } = useTranslation();
  const { 
    partner1, userName, email, user, stage, country, currency, joinDate, bio, profilePhoto,
    everBondId, connectionStatus, familyWorkspaceId, language, timezone, provider, lastLogin, verificationStatus
  } = store;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [familyMembersCount, setFamilyMembersCount] = useState(0);

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch family members count from Firestore if in family mode
  useEffect(() => {
    if (familyWorkspaceId && db) {
      const docRef = doc(db, 'familyWorkspaces', familyWorkspaceId);
      getDoc(docRef)
        .then(snap => {
          if (snap.exists()) {
            const members = snap.data().members || [];
            setFamilyMembersCount(members.length);
          }
        })
        .catch(err => console.error("Error fetching family members:", err));
    } else {
      setFamilyMembersCount(0);
    }
  }, [familyWorkspaceId]);

  // Helper to get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'EB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date safely
  const formatDateTime = (isoString) => {
    if (!isoString) return t('not_available', 'Not available');
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

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

  const isDesktop = windowWidth > 1024;

  return (
    <div className="fade-in" style={{ width: '100%', paddingBottom: '60px' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div className="page-eyebrow">{t('identity_workspace', 'Identity Workspace')}</div>
          <h1 className="page-title">{t('personal', 'Personal')} <em>{t('profile', 'Profile')}</em></h1>
          <p className="page-desc">{t('profile_desc', 'Manage your digital EverBond node, personal parameters, and security tokens.')}</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ 
            width: 'auto', 
            padding: '12px 24px', 
            background: `linear-gradient(135deg, ${T.gold} 0%, #a07d22 100%)`,
            boxShadow: 'var(--sh-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '100px'
          }}
          onClick={() => setIsEditModalOpen(true)}
        >
          <Edit3 size={15} /> {t('edit_profile', 'Edit Profile')}
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(12, 1fr)' : '1fr',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        
        {/* COLUMN 1: IDENTITY CARD (Left Column) */}
        <motion.div variants={itemVariants} style={{ gridColumn: isDesktop ? 'span 4' : 'span 12' }}>
          <Card gold={true} style={{ padding: '32px 24px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
            
            {/* Avatar container */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt={partner1 || userName || 'User'} 
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `3px solid ${T.gold}`,
                    boxShadow: '0 8px 30px rgba(184, 144, 42, 0.2)'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.goldMid} 0%, ${T.gold} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  fontFamily: T.fontDisplay,
                  boxShadow: 'var(--sh-gold)',
                  border: '3px solid var(--bg-card)'
                }}>
                  {getInitials(partner1 || userName)}
                </div>
              )}
              
              <button 
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-mid)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow)',
                  cursor: 'pointer',
                  color: T.gold
                }}
              >
                <Edit3 size={14} />
              </button>
            </div>

            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
              {partner1 || userName || 'User'}
            </h2>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: T.gold, marginBottom: '20px', letterSpacing: '0.5px' }}>
              {everBondId || 'EB-XXXXXX'}
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px' }}>{t('email_address', 'Email Address')}</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>{email || user?.email || 'N/A'}</span>
              </div>
              
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px' }}>{t('relationship_mode', 'Relationship Mode')}</span>
                <span style={{ 
                  fontSize: '0.72rem', 
                  background: stage === 'Married' ? 'rgba(184, 144, 42, 0.12)' : stage === 'Committed' ? 'rgba(208, 92, 114, 0.12)' : 'rgba(74, 140, 196, 0.12)', 
                  padding: '4px 12px', 
                  borderRadius: '100px', 
                  color: stage === 'Married' ? T.gold : stage === 'Committed' ? T.rose : T.sky, 
                  fontWeight: 700,
                  display: 'inline-block'
                }}>
                  {stage === 'Married' ? t('family_dynasty', 'Family Dynasty') : (stage === 'Committed' ? t('partner_mode', 'Partner Mode') : t('single_mode', 'Single Mode'))}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px' }}>{t('member_since', 'Member Since')}</span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text)', fontWeight: 700 }}>{joinDate || 'June 2026'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '2px', textAlign: 'right' }}>{t('verification', 'Verification')}</span>
                  <span style={{ 
                    fontSize: '0.74rem', 
                    color: verificationStatus === 'Verified' ? T.sage : T.gold, 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: verificationStatus === 'Verified' ? T.sage : T.gold }} />
                    {verificationStatus === 'Verified' ? t('verified', 'Verified') : t('pending', 'Pending')}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* RIGHT STACK COLUMN (Desktop span 8) */}
        <motion.div variants={itemVariants} style={{ gridColumn: isDesktop ? 'span 8' : 'span 12', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SECTION 2: Personal Information */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <User size={18} style={{ color: T.gold }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)', fontFamily: T.fontDisplay }}>{t('personal_information', 'Personal Information')}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('country', 'Country')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{country || t('not_set', 'Not Set')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <DollarSign size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('preferred_currency', 'Preferred Currency')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{currency || 'INR'} ({currency === 'USD' ? '$' : '₹'})</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Globe size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('language', 'Language')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{language || 'English'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Clock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('timezone', 'Timezone')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{timezone || 'GMT+5:30'}</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800, display: 'block', marginBottom: '6px' }}>{t('bio', 'Bio')}</span>
              {bio ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                  "{bio}"
                </p>
              ) : (
                <p style={{ color: 'var(--text-faint)', fontSize: '0.86rem', margin: 0 }}>
                  {t('no_bio_written', 'No biography written. Click edit to add a personal bio.')}
                </p>
              )}
            </div>
          </Card>

          {/* SECTION 3: Security & Access */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <Shield size={18} style={{ color: T.gold }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)', fontFamily: T.fontDisplay }}>{t('security_access', 'Security & Access')}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('login_provider', 'Login Provider')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{provider || 'Google'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Smartphone size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('connected_devices', 'Connected Devices')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{t('active_sessions_count', '2 Active Sessions')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('last_login_time', 'Last Login Time')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{formatDateTime(lastLogin)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('security_status', 'Security Status')}</div>
                  <div style={{ 
                    fontSize: '0.82rem', 
                    color: T.sage, 
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {t('guard_active', '● Guard Active')}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* SECTION 4: Workspace Information */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <Laptop size={18} style={{ color: T.gold }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text)', fontFamily: T.fontDisplay }}>{t('workspace_information', 'Workspace Information')}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Activity size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('current_workspace', 'Current Workspace')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                    {stage === 'Married' ? t('family_dynasty', 'Family Dynasty') : (stage === 'Committed' ? t('partner_mode', 'Partner Mode') : t('single_mode', 'Single Mode'))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Heart size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('partner_status', 'Partner Status')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: connectionStatus === 'connected' ? T.gold : 'var(--text-muted)' }}>
                    {connectionStatus === 'connected' ? t('connected', 'Connected') : t('disconnected', 'Disconnected')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--bg-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, flexShrink: 0 }}>
                  <Users size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 800 }}>{t('family_members', 'Family Members')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                    {stage === 'Married' ? t('family_members_count', '{count} Members').replace('{count}', familyMembersCount) : t('requires_family_mode', 'N/A (Requires Family Mode)')}
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </motion.div>
      </motion.div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
