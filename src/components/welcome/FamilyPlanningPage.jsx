import React, { useState, useEffect, useRef } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { T } from '../../theme/tokens';
import { Card } from '../common/Card';
import { useToast } from '../common/Toast';
import { 
  Crown, Sparkles, GraduationCap, Coins, Plus, Trash2, 
  ArrowUpRight, Lock, Key, ShieldCheck, FileText, Share2, Copy,
  UserPlus, QrCode as QrCodeIcon, ToggleLeft, ToggleRight, Info, Check, CheckCircle2, ChevronRight,
  Users, Shield, Heart, UserCheck, RefreshCw, X, ArrowRight
} from 'lucide-react';
import { formatCurrency, formatCompact } from '../../utils/finance';
import { useTranslation } from '../../utils/i18n';
import { Logo } from '../common/Logo';
import * as QRCodeModule from 'react-qr-code';
import { db } from '../../utils/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const QRCode = QRCodeModule.QRCode || QRCodeModule.default || QRCodeModule;

export function FamilyPlanningPage({ setPage, joinCode }) {
  const toast = useToast();
  const user = useFinanceStore(s => s.user);
  
  const { 
    partner1, 
    partner2, 
    currency, 
    theme,
    getTotalSalary, 
    partnerAccepted,
    relationshipStage,
    stage,
    partnerLinked,
    familyWorkspaceId
  } = useFinanceStore();
  
  const { t } = useTranslation();
  
  const total = getTotalSalary();
  const isLinked = partnerLinked || partnerAccepted;
  const currentStage = (relationshipStage || stage || 'Single').toLowerCase();

  // Onboarding step (1 to 6)
  const [onbStep, setOnbStep] = useState(1);
  const [dynastyName, setDynastyName] = useState('');
  const [dynastyDesc, setDynastyDesc] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('Founder'); // 'Founder' | 'Parent' | 'Spouse' | 'Child' | 'Advisor'
  const [isActivating, setIsActivating] = useState(false);
  const [hasCreatedWorkspace, setHasCreatedWorkspace] = useState(false);
  const [activationChecked, setActivationChecked] = useState(false);

  // Join flow states
  const [joinStep, setJoinStep] = useState(1); // 1: Select Role/Consent, 2: Success
  const [fetchedWorkspace, setFetchedWorkspace] = useState(null);
  const [isFetchingWorkspace, setIsFetchingWorkspace] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinConsentChecked, setJoinConsentChecked] = useState(false);

  // Fetch active workspace name
  const [dynastyWorkspaceName, setDynastyWorkspaceName] = useState('');
  useEffect(() => {
    if (familyWorkspaceId && db) {
      getDoc(doc(db, 'familyWorkspaces', familyWorkspaceId))
        .then(docSnap => {
          if (docSnap.exists()) {
            setDynastyWorkspaceName(docSnap.data().name);
          }
        })
        .catch(err => console.error("Error fetching family workspace name:", err));
    }
  }, [familyWorkspaceId]);

  // Generate Family Code suffix
  const generateFamilyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `EB-DYNASTY-${suffix}`;
    setFamilyCode(code);
    return code;
  };

  // Fetch workspace for joinCode
  useEffect(() => {
    if (joinCode && db) {
      setIsFetchingWorkspace(true);
      setFetchError('');
      
      const q = query(collection(db, 'familyWorkspaces'), where('familyCode', '==', joinCode));
      getDocs(q)
        .then(querySnap => {
          if (querySnap.empty) {
            setFetchError("Dynasty invitation code not found or invalid.");
          } else {
            const wDoc = querySnap.docs[0];
            setFetchedWorkspace(wDoc.data());
          }
        })
        .catch(err => {
          console.error("Error fetching dynasty workspace:", err);
          setFetchError("Failed to load dynasty workspace. Please try again.");
        })
        .finally(() => {
          setIsFetchingWorkspace(false);
        });
    }
  }, [joinCode]);

  // Establish {t('family_dynasty', 'Family Dynasty')} Workspace (Step 6)
  const handleActivateDynasty = async () => {
    if (!user?.uid) {
      toast.error(t('user_session_not_found', 'User session not found. Please log in again.'));
      return;
    }
    if (!dynastyName.trim()) {
      toast.error(t('please_provide_dynasty_name', 'Please provide a name for your Dynasty.'));
      return;
    }
    setIsActivating(true);
    try {
      const workspaceId = doc(collection(db, 'familyWorkspaces')).id;
      const workspaceRef = doc(db, 'familyWorkspaces', workspaceId);
      
      const batch = writeBatch(db);

      // Create workspace doc
      batch.set(workspaceRef, {
        workspaceId,
        name: dynastyName.trim(),
        description: dynastyDesc.trim(),
        ownerUid: user.uid,
        ownerName: user.name || 'User',
        ownerEmail: user.email || '',
        familyCode: familyCode,
        members: [
          {
            uid: user.uid,
            role: selectedRole,
            name: user.name || 'User',
            email: user.email || '',
            joinedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      });

      // Update user doc
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        familyWorkspaceId: workspaceId,
        mode: 'Family Dynasty'
      });

      await batch.commit();

      // Update Zustand
      useFinanceStore.setState({
        familyWorkspaceId: workspaceId,
        stage: 'Married',
        relationshipStage: 'Married',
        relationshipStatus: 'Married'
      });

      setHasCreatedWorkspace(true);
      toast.success(t('dynasty_activated_success', 'Family Dynasty Workspace activated!'));
    } catch (err) {
      console.error("Dynasty activation error:", err);
      toast.error(t('failed_activate_dynasty', 'Failed to activate Dynasty Workspace.'));
    } finally {
      setIsActivating(false);
    }
  };

  // Join Dynasty Workspace
  const handleJoinDynasty = async () => {
    if (!user?.uid || !fetchedWorkspace) return;
    setIsJoining(true);
    try {
      const workspaceId = fetchedWorkspace.workspaceId;
      const workspaceRef = doc(db, 'familyWorkspaces', workspaceId);

      const newMember = {
        uid: user.uid,
        role: selectedRole,
        name: user.name || 'User',
        email: user.email || '',
        joinedAt: new Date().toISOString()
      };

      const batch = writeBatch(db);
      
      const updatedMembers = [...(fetchedWorkspace.members || []), newMember];
      batch.update(workspaceRef, {
        members: updatedMembers
      });

      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, {
        familyWorkspaceId: workspaceId,
        mode: 'Family Dynasty'
      });

      await batch.commit();

      useFinanceStore.setState({
        familyWorkspaceId: workspaceId,
        stage: 'Married',
        relationshipStage: 'Married',
        relationshipStatus: 'Married'
      });

      setJoinStep(2);
      toast.success(t('joined_dynasty_success', 'Successfully joined Family Dynasty!'));
    } catch (err) {
      console.error("Error joining Family Dynasty:", err);
      toast.error(t('failed_join_dynasty', 'Failed to join Dynasty workspace.'));
    } finally {
      setIsJoining(false);
    }
  };

  const getJoinUrl = (codeVal) => {
    return `https://everbond.app/join-dynasty/${codeVal || familyCode}`;
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return '***@gmail.com';
    const [name, domain] = emailStr.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const rolesConfig = [
    { id: 'Founder', title: t('role_founder_title', 'Founder'), desc: t('role_founder_desc', 'Creator & primary trustee. Complete control over governance & heir allocations.') },
    { id: 'Parent', title: t('role_parent_title', 'Parent'), desc: t('role_parent_desc', 'Joint manager of the asset pool. Coordinate milestone planning and projections.') },
    { id: 'Spouse', title: t('role_spouse_title', 'Spouse'), desc: t('role_spouse_desc', 'Joint co-trustee. Unified portfolio tracking & dual signatures.') },
    { id: 'Child', title: t('role_child_title', 'Child'), desc: t('role_child_desc', 'Heir & beneficiary. View-only access to trust fund release conditions.') },
    { id: 'Advisor', title: t('role_advisor_title', 'Advisor'), desc: t('role_advisor_desc', 'Wealth consultant or legal manager. View-only planning access.') }
  ];

  // ────────────────────────────────────────────────────────────────
  // JOIN DYNASTY RENDER FLOW
  // ────────────────────────────────────────────────────────────────
  if (joinCode) {
    if (isFetchingWorkspace) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
          <Card style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '440px', width: '100%' }}>
            <RefreshCw size={36} className="skeleton-pulse" style={{ color: T.gold, margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{t('loading_dynasty_invitation', 'Loading Dynasty Invitation...')}</h3>
          </Card>
        </div>
      );
    }

    if (fetchError) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
          <Card style={{ textAlign: 'center', padding: '40px 24px', maxWidth: '440px', width: '100%', border: '1px solid var(--rose-border)' }}>
            <Lock size={36} style={{ color: 'var(--rose)', margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', color: 'var(--text)' }}>{t('invalid_invitation', 'Invalid Invitation')}</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>{fetchError}</p>
            <button onClick={() => setPage('dashboard')} className="onb-btn-back" style={{ width: '100%', padding: '12px' }}>
              {t('back_to_dashboard', 'Back to Dashboard')}
            </button>
          </Card>
        </div>
      );
    }

    if (joinStep === 2) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
          <Card gold={true} style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.16) 0%, transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              border: `2px solid ${T.gold}`
            }}>
              <UserCheck size={36} style={{ color: T.gold }} />
            </div>
            
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
              {t('joined_dynasty', 'Joined Dynasty')}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
              {t('joined_dynasty_desc_before', 'You have successfully linked your profile with the')} <strong>{fetchedWorkspace?.name}</strong> {t('joined_dynasty_desc_after', 'Dynasty.')}
            </p>

            <button
              onClick={() => {
                setPage('family-planning');
                window.location.hash = '#/family-dynasty';
              }}
              className="onb-btn-continue"
              style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
            >
              {t('open_dynasty_command', 'Open Dynasty Command')}
            </button>
          </Card>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
        <Card gold={true} style={{ maxWidth: '500px', width: '100%', padding: '32px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--gold-pale)', color: T.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              border: `1px solid ${T.gold}30`
            }}>
              <Crown size={24} />
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              {t('join_family_dynasty', 'Join Family Dynasty')}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              {t('invited_join_dynasty_desc', 'You are invited to join a secure multi-generational workspace.')}
            </p>
          </div>

          <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              {t('dynasty_parameters', 'Dynasty Parameters')}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('dynasty_name_label', 'Dynasty Name')}:</span>
                <strong style={{ color: 'var(--text)' }}>{fetchedWorkspace?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('founder_name_label', 'Founder Name:')}</span>
                <strong style={{ color: 'var(--text)' }}>{fetchedWorkspace?.ownerName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('founder_email_label', 'Founder Email:')}</span>
                <strong style={{ color: 'var(--text)' }}>{maskEmail(fetchedWorkspace?.ownerEmail)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('current_members_label', 'Current Members:')}</span>
                <strong style={{ color: 'var(--text)' }}>{fetchedWorkspace?.members?.length || 0}</strong>
              </div>
            </div>
          </div>

          {/* Role selection inside join flow */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              {t('select_role_in_dynasty', 'Select Your Role in the Dynasty')}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rolesConfig.filter(r => r.id !== 'Founder').map(role => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    background: selectedRole === role.id ? 'rgba(184, 144, 42, 0.05)' : 'var(--bg-warm)',
                    border: `1.5px solid ${selectedRole === role.id ? T.gold : 'var(--border)'}`,
                    borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                    transition: 'border-color 0.18s'
                  }}
                >
                  <strong style={{ fontSize: '0.8rem', color: selectedRole === role.id ? T.gold : 'var(--text)', display: 'block' }}>
                    {role.title}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{role.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="join-consent"
              checked={joinConsentChecked}
              onChange={(e) => setJoinConsentChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="join-consent" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45, cursor: 'pointer' }}>
              {t('join_consent_label', 'I agree to synchronize my allocations and asset ledger with this Dynasty workspace.')}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleJoinDynasty}
              disabled={!joinConsentChecked || isJoining}
              className="onb-btn-continue"
              style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem', opacity: (joinConsentChecked && !isJoining) ? 1 : 0.6 }}
            >
              {isJoining ? t('joining_status', 'Joining...') : t('join_workspace_btn', 'Join Workspace')}
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              {t('cancel', 'Cancel')}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // DEDICATED WIZARD ONBOARDING FLOW (STEPS 1 TO 6)
  // ────────────────────────────────────────────────────────────────
  if (!familyWorkspaceId) {
    if (hasCreatedWorkspace) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '16px' }}>
          <Card gold={true} style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 144, 42, 0.16) 0%, transparent 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              border: `2px solid ${T.gold}`
            }}>
              <CheckCircle2 size={36} style={{ color: T.gold }} />
            </div>
            
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
              {t('dynasty_established', 'Dynasty Established')}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
              {t('dynasty_established_desc', 'Your secure Family Dynasty workspace is now live. Invite trusted members and start tracking multi-generational wealth.')}
            </p>

            <button
              onClick={() => {
                setOnbStep(1);
                // Trigger refresh by navigating or state update
              }}
              className="onb-btn-continue"
              style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
            >
              {t('open_workspace', 'Open Workspace')}
            </button>
          </Card>
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '580px', margin: '40px auto 60px', padding: '0 16px' }}>
        
        {/* Progress Tracker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.72rem', color: T.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('dynasty_setup_step', 'Dynasty Setup (Step {step} of 6)').replace('{step}', onbStep)}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5, 6].map(stepNum => (
              <div
                key={stepNum}
                style={{
                  width: '24px', height: '4px', borderRadius: '2px',
                  background: onbStep >= stepNum ? T.gold : 'var(--border)'
                }}
              />
            ))}
          </div>
        </div>

        <Card style={{ padding: '32px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%',
            background: 'radial-gradient(circle at center, rgba(184,144,42,0.02) 0%, transparent 60%)',
            pointerEvents: 'none'
          }} />

          {/* STEP 1: Dynasty Introduction */}
          {onbStep === 1 && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gold-pale)', color: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: `1px solid ${T.gold}30`
                }}>
                  <Crown size={24} />
                </div>
                <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('family_dynasty', 'Family Dynasty')}
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  {t('family_dynasty_intro_desc', 'Coordinate multi-generational planning, distribute inheritance allocations, and lock secure trusts.')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {[
                  { title: t('shared_family_pool', 'Shared Family Pool'), desc: t('shared_family_pool_desc', 'Consolidate calculations and projection models across members.') },
                  { title: t('inheritance_allocations', 'Inheritance Allocations'), desc: t('inheritance_allocations_desc', 'Designate trust releases triggered by milestones or ages.') },
                  { title: t('sovereign_trust_vault', 'Sovereign Trust Vault'), desc: t('sovereign_trust_vault_desc', 'Dual-signature safety parameter rules for sensitive documentation.') },
                  { title: t('trusted_role_boundaries', 'Trusted Role Boundaries'), desc: t('trusted_role_boundaries_desc', 'Founder, Spouse, Parent, Child, and Advisor permissions.') }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(184,144,42,0.1)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontSize: '0.65rem', fontWeight: 'bold' }}>✓</div>
                    <div>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text)', display: 'block' }}>{item.title}</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setOnbStep(2)}
                  className="onb-btn-continue"
                  style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('create_dynasty_btn', 'Create Dynasty')}
                </button>
                <button
                  onClick={() => setPage('dashboard')}
                  className="onb-btn-back"
                  style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('back_btn', 'Back')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: {t('create_dynasty_btn', 'Create Dynasty')} Form */}
          {onbStep === 2 && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('name_your_dynasty', 'Name Your Dynasty')}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('establish_identity_pool', 'Establish the identity of your family planning pool.')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <div>
                  <label htmlFor="dynasty-name-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {t('dynasty_name_label', 'Dynasty Name')}
                  </label>
                  <input
                    id="dynasty-name-input"
                    type="text"
                    className="onb-input-glow"
                    placeholder={t('dynasty_name_placeholder', 'e.g. Skywalker, Rothschild')}
                    value={dynastyName}
                    onChange={(e) => setDynastyName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label htmlFor="dynasty-desc-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {t('dynasty_description_label', 'Dynasty Description (Optional)')}
                  </label>
                  <textarea
                    id="dynasty-desc-input"
                    className="onb-input-glow"
                    placeholder={t('dynasty_description_placeholder', 'e.g. Securing assets across generations and establishing family governance.')}
                    value={dynastyDesc}
                    onChange={(e) => setDynastyDesc(e.target.value)}
                    style={{ width: '100%', height: '80px', padding: '10px 14px', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    if (!dynastyName.trim()) {
                      toast.error(t('dynasty_name_required', 'Dynasty Name is required.'));
                      return;
                    }
                    generateFamilyCode();
                    setOnbStep(3);
                  }}
                  disabled={!dynastyName.trim()}
                  className="onb-btn-continue"
                  style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem', opacity: dynastyName.trim() ? 1 : 0.6 }}
                >
                  {t('continue_btn', 'Continue')}
                </button>
                <button
                  onClick={() => setOnbStep(1)}
                  className="onb-btn-back"
                  style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('back_btn', 'Back')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Generate Family Code */}
          {onbStep === 3 && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gold-pale)', color: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: `1px solid ${T.gold}30`
                }}>
                  <Key size={24} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('your_family_code', 'Your Family Code')}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('family_code_desc', 'This unique key allows family members to search and connect.')}
                </p>
              </div>

              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '32px' }}>
                <strong style={{ fontSize: '1.5rem', color: T.gold, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {familyCode}
                </strong>
                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(familyCode);
                      toast.success(t('code_copied_clipboard', 'Code copied to clipboard!'));
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px' }}
                  >
                    <Copy size={12} /> {t('copy_family_code_btn', 'Copy Family Code')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setOnbStep(4)}
                  className="onb-btn-continue"
                  style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('continue_to_invites_btn', 'Continue to Invites')}
                </button>
                <button
                  onClick={() => setOnbStep(2)}
                  className="onb-btn-back"
                  style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('back_btn', 'Back')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: {t('invite_members_title', 'Invite Members')} */}
          {onbStep === 4 && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.35rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('invite_members_title', 'Invite Members')}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('invite_members_desc', 'Select an invitation route below to add trusted members to your dynasty.')}
                </p>
              </div>

              {/* QR display */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  background: '#fff', padding: '12px', borderRadius: '16px',
                  border: `1.5px solid ${T.gold}30`, display: 'inline-flex',
                  boxShadow: '0 6px 20px rgba(184,144,42,0.08)', marginBottom: '16px'
                }}>
                  <QRCode value={getJoinUrl()} size={140} fgColor="#12110E" bgColor="#FFFFFF" level="H" />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block' }}>{t('scan_connect_node', 'Scan to connect node')}</span>
              </div>

              {/* {t('copy_btn', 'Copy')} URL */}
              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 14px', marginBottom: '28px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>{t('shareable_invite_link', 'Shareable Invite Link')}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1, textAlign: 'left' }}>
                    {getJoinUrl()}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getJoinUrl());
                      toast.success(t('link_copied', 'Link copied!'));
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Copy size={11} /> {t('copy_btn', 'Copy')}
                  </button>
                  <button
                    onClick={async () => {
                      if (navigator.share) {
                        try {
                          await navigator.share({
                            title: t('everbond_family_dynasty_invitation', 'EverBond Family Dynasty Invitation'),
                            text: `Join the ${dynastyName || 'Family'} Dynasty workspace on EverBond.`,
                            url: getJoinUrl(),
                          });
                          toast.success(t('shared_successfully', 'Shared successfully!'));
                        } catch (err) {
                          console.log("Share API error:", err);
                        }
                      } else {
                        navigator.clipboard.writeText(getJoinUrl());
                        toast.success(t('link_copied', 'Link copied!'));
                      }
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Share2 size={11} /> {t('share_btn', 'Share')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setOnbStep(5)}
                  className="onb-btn-continue"
                  style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('continue_to_roles_btn', 'Continue to Roles')}
                </button>
                <button
                  onClick={() => setOnbStep(3)}
                  className="onb-btn-back"
                  style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('back_btn', 'Back')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Role Selection */}
          {onbStep === 5 && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.35rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('your_dynasty_role', 'Your Dynasty Role')}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('assign_role_desc', 'Assign your role parameters in the family workspace.')}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {rolesConfig.map(role => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      background: selectedRole === role.id ? 'rgba(184, 144, 42, 0.04)' : 'var(--bg-warm)',
                      border: `1.5px solid ${selectedRole === role.id ? T.gold : 'var(--border)'}`,
                      borderRadius: '12px', padding: '12px 16px', cursor: 'pointer',
                      transition: 'border-color 0.18s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.85rem', color: selectedRole === role.id ? T.gold : 'var(--text)' }}>
                        {role.title}
                      </strong>
                      {selectedRole === role.id && <Check size={14} style={{ color: T.gold }} />}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                      {role.desc}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setOnbStep(6)}
                  className="onb-btn-continue"
                  style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('continue_to_activation_btn', 'Continue to Activation')}
                </button>
                <button
                  onClick={() => setOnbStep(4)}
                  className="onb-btn-back"
                  style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('back_btn', 'Back')}
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: DB Workspace Activation */}
          {onbStep === 6 && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gold-pale)', color: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: `1px solid ${T.gold}30`
                }}>
                  <ShieldCheck size={24} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.35rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('activate_dynasty_workspace', 'Activate Dynasty Workspace')}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {t('confirm_parameters_desc', 'Confirm Parameters to instantiate the multi-generation ledger on Firestore.')}
                </p>
              </div>

              {/* Summary Card */}
              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                  {t('confirmation_ledger', 'Confirmation Ledger')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('dynasty_name_label', 'Dynasty Name')}:</span>
                    <strong style={{ color: 'var(--text)' }}>{dynastyName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('assigned_role_confirm', 'Your Assigned Role:')}</span>
                    <strong style={{ color: T.gold }}>{t(selectedRole.toLowerCase(), selectedRole)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{t('family_code_confirm', 'Family Code:')}</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{familyCode}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '28px' }}>
                <input
                  type="checkbox"
                  id="activate-consent"
                  checked={activationChecked}
                  onChange={(e) => setActivationChecked(e.target.checked)}
                  style={{ marginTop: '3px', accentColor: T.gold }}
                />
                <label htmlFor="activate-consent" style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.45, cursor: 'pointer' }}>
                  I agree to instantiate this {t('family_dynasty', 'Family Dynasty')} and link my financial planning node to this workspace.
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleActivateDynasty}
                  disabled={!activationChecked || isActivating}
                  className="onb-btn-continue"
                  style={{ flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem', opacity: (activationChecked && !isActivating) ? 1 : 0.6 }}
                >
                  {isActivating ? t('activating_ledger', 'Activating Ledger...') : t('activate_dynasty_btn', 'Activate Dynasty')}
                </button>
                <button
                  onClick={() => setOnbStep(5)}
                  className="onb-btn-back"
                  style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
                >
                  {t('back_btn', 'Back')}
                </button>
              </div>
            </div>
          )}

        </Card>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // END ONBOARDING & ACTIVE DYNASTY DASHBOARD RENDER
  // ────────────────────────────────────────────────────────────────
  
  // Dashboard Fallback States
  const [isSimulatedLinked, setIsSimulatedLinked] = useState(true);
  const [compoundingYears, setCompoundingYears] = useState(30);
  const [monthlyContribution, setMonthlyContribution] = useState(2500);
  const [expectedYield, setExpectedYield] = useState(8.5);
  const [initialCorpus, setInitialCorpus] = useState(250000);

  const [children, setChildren] = useState([
    { id: 1, name: 'Aarav', age: 14, allocation: 40, milestone: 'Graduation', locked: true, releaseAge: 25 },
    { id: 2, name: 'Ananya', age: 11, allocation: 40, milestone: 'Age Threshold', locked: true, releaseAge: 25 },
    { id: 3, name: 'Grandchildren Trust', age: 0, allocation: 20, milestone: 'Dynastic Multi-gen', locked: true, releaseAge: 35 }
  ]);

  const [selectedChildId, setSelectedChildId] = useState(1);
  const [newHeirName, setNewHeirName] = useState('');
  const [newHeirAge, setNewHeirAge] = useState(5);
  const [newHeirAllocation, setNewHeirAllocation] = useState(20);

  // Document Vault State
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Last Will & Testament.pdf', type: 'Will', size: '2.4 MB', date: '2026-05-12', signed: true },
    { id: 2, name: 'Family Living Trust Agreement.pdf', type: 'Trust', size: '4.8 MB', date: '2026-06-01', signed: true },
    { id: 3, name: 'Asset Distribution Ledger.xlsx', type: 'Ledger', size: '1.2 MB', date: '2026-06-08', signed: false },
    { id: 4, name: 'Multi-Gen Power of Attorney.pdf', type: 'POA', size: '3.1 MB', date: '2026-04-20', signed: true }
  ]);

  // Governance settings
  const [requireDualSignature, setRequireDualSignature] = useState(true);
  const [releaseTriggers, setReleaseTriggers] = useState({
    college: true,
    marriage: false,
    firstHome: true,
    age25: true
  });

  // QR Invite simulator
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInviteRole, setQrInviteRole] = useState('successor'); // 'successor' | 'co-trustee'
  const [invitationCode, setInvitationCode] = useState('');

  const generateCode = () => {
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    setInvitationCode(`EVDN-${qrInviteRole.toUpperCase()}-${randomHex}`);
  };

  useEffect(() => {
    generateCode();
  }, [qrInviteRole]);

  // Dynastic compounder projection math
  const calculateProjection = () => {
    const P = initialCorpus;
    const PMT = monthlyContribution;
    const r = expectedYield / 100;
    const n = 12;
    const t = compoundingYears;

    // Compound Formula: P * (1 + r/n)^(n*t) + PMT * [((1 + r/n)^(n*t) - 1) / (r/n)]
    const ratePerPeriod = r / n;
    const totalPeriods = n * t;
    const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
    
    const futureValueInitial = P * compoundFactor;
    const futureValueAnnuity = ratePerPeriod > 0 
      ? PMT * ((compoundFactor - 1) / ratePerPeriod) * (1 + ratePerPeriod)
      : PMT * totalPeriods;

    return futureValueInitial + futureValueAnnuity;
  };

  const projectedValue = calculateProjection();

  // Allocation sliders normalization
  const handleAllocationChange = (id, newVal) => {
    const parsedVal = Math.min(100, Math.max(0, parseInt(newVal) || 0));
    setChildren(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, allocation: parsedVal } : c);
      
      // Keep sum close to 100% or just let it adjust
      const currentSum = updated.reduce((sum, curr) => sum + curr.allocation, 0);
      if (currentSum === 0) return updated;

      // Re-scale other nodes to sum to 100
      const activeIdx = updated.findIndex(c => c.id === id);
      const remainingWeight = 100 - parsedVal;
      const otherSum = updated.reduce((sum, curr, idx) => idx !== activeIdx ? sum + curr.allocation : sum, 0);

      if (otherSum === 0) {
        // distribute evenly
        const remainderCount = updated.length - 1;
        return updated.map((c, idx) => idx !== activeIdx ? { ...c, allocation: Math.round(remainingWeight / remainderCount) } : c);
      }

      return updated.map((c, idx) => {
        if (idx === activeIdx) return c;
        const scale = remainingWeight / otherSum;
        return { ...c, allocation: Math.round(c.allocation * scale) };
      });
    });
  };

  const addHeirNode = () => {
    if (!newHeirName.trim()) return;
    const newId = Date.now();
    const currentCount = children.length;
    
    // Distribute allocation evenly including new child
    const targetAllot = Math.round(100 / (currentCount + 1));
    const normalizedOldAllot = Math.round((100 - targetAllot) / currentCount);

    const updatedChildren = children.map(c => ({ ...c, allocation: normalizedOldAllot }));
    
    setChildren([
      ...updatedChildren,
      {
        id: newId,
        name: newHeirName.trim(),
        age: parseInt(newHeirAge) || 10,
        allocation: targetAllot,
        milestone: 'Age Threshold',
        locked: true,
        releaseAge: 25
      }
    ]);
    setSelectedChildId(newId);
    setNewHeirName('');
  };

  const removeHeirNode = (id) => {
    if (children.length <= 1) return; // Must have at least one heir
    const removedChild = children.find(c => c.id === id);
    const updated = children.filter(c => c.id !== id);
    const addedAllot = Math.round(removedChild.allocation / updated.length);

    setChildren(updated.map((c, idx) => ({ 
      ...c, 
      allocation: idx === 0 
        ? c.allocation + (100 - updated.reduce((s, curr) => s + curr.allocation, 0) - removedChild.allocation) + addedAllot
        : c.allocation + addedAllot
    })));

    if (selectedChildId === id) {
      setSelectedChildId(updated[0].id);
    }
  };

  const toggleDocumentSign = (id) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, signed: !doc.signed } : doc));
  };

  const totalAllocation = children.reduce((sum, c) => sum + c.allocation, 0);

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  const fmt = val => formatCurrency(val, currency);
  const cmpct = val => formatCompact(val, currency);

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* Page Header */}
      <div className="eb-page-header">
        <div className="eb-page-header-left">
          <div className="eb-logo-glass-card">
            <Logo size={32} showText={false} />
          </div>
        </div>
        <div className="eb-page-header-right" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div className="page-eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="stage-badge married" style={{ background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`, color: '#fff' }}>{t('family_dynasty', 'Family Dynasty')}</span>
              <span style={{ color: 'var(--text-muted)' }}>{t('multigen_asset_command', '· Multi-Generational Asset Command')}</span>
            </div>
            <h1 className="page-title" style={{ marginTop: '8px' }}>
              {dynastyWorkspaceName ? `${dynastyWorkspaceName} ${t('family', 'Family Dynasty')}` : t('family', 'Family Dynasty')}
            </h1>
            <p className="page-desc">
              {t('dynasty_page_desc', 'Oversee trust fund allocations, successors inheritance metrics, secure vaults, and dynamic rule governance.')}
            </p>
          </div>
          
          {/* Apple Switch for Simulated Link State */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-muted)',
            padding: '6px 14px',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{t('simulate_active_partner', 'Simulate Active Partner:')}</span>
            <button 
              onClick={() => setIsSimulatedLinked(!isSimulatedLinked)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isSimulatedLinked ? T.gold : 'var(--text-faint)'
              }}
            >
              {isSimulatedLinked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Lock Banner if neither actual nor simulated is accepted */}
      {!isSimulatedLinked && (
        <div style={{
          background: 'rgba(184, 144, 42, 0.06)',
          border: `1.5px dashed ${T.gold}50`,
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Lock size={20} style={{ color: T.gold }} />
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                {t('dynasty_restricted_title', 'Collaborative Dynasty Dashboard Restricted')}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {t('dynasty_restricted_desc', 'Invite a co-trustee or partner to lock in multi-generational governance rules and verify asset ledger changes.')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className="btn-primary" 
              style={{ background: T.gold, fontSize: '0.75rem', padding: '8px 16px', width: 'auto', borderRadius: '12px' }}
              onClick={() => setShowQRModal(true)}
            >
              <UserPlus size={14} style={{ marginRight: '6px' }} /> {t('invite_co_trustee_btn', 'Invite Co-Trustee')}
            </button>
            <button 
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.75rem', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer' }}
              onClick={() => setIsSimulatedLinked(true)}
            >
              {t('bypass_demo_lock_btn', 'Bypass Demo Lock')}
            </button>
          </div>
        </div>
      )}

      {/* Main Multi-Gen Dashboard Grid */}
      <div className="grid-2" style={{ gap: '24px', alignItems: 'stretch' }}>
        
        {/* SECTION 1: DYNASTIC COMPOUNDER & VISUAL ESTATE */}
        <Card gold={isSimulatedLinked} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div className="card-title" style={{ color: T.gold, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crown size={15} /> {t('dynastic_compounder_title', 'Dynastic Compounder')}
              </div>
              <span style={{ fontSize: '0.7rem', background: 'var(--gold-pale)', color: T.gold, padding: '3px 8px', borderRadius: '999px', fontWeight: 700 }}>
                {t('projected_estate_label', 'Projected Estate')}
              </span>
            </div>
            <div className="card-heading" style={{ fontSize: '1.3rem' }}>{t('generational_vault_projections', 'Generational Wealth Vault Projections')}</div>
            <div className="card-sub" style={{ marginBottom: '20px' }}>{t('generational_vault_projections_desc', 'Compounding assets dedicated for family legacy inheritance.')}</div>

            {/* Projection Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '20px 0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>{t('initial_trust_corpus', 'Initial Trust Fund Corpus')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(initialCorpus)}</span>
                </div>
                <input 
                  type="range" 
                  min="50000" 
                  max="2000000" 
                  step="50000"
                  value={initialCorpus} 
                  onChange={e => setInitialCorpus(Number(e.target.value))}
                  style={{ width: '100%', accentColor: T.gold }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  <span>{t('monthly_contribution_legacy', 'Monthly Contribution to Legacy Fund')}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(monthlyContribution)}/mo</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="15000" 
                  step="500"
                  value={monthlyContribution} 
                  onChange={e => setMonthlyContribution(Number(e.target.value))}
                  style={{ width: '100%', accentColor: T.gold }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    <span>{t('target_horizon', 'Target Horizon')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{compoundingYears} {t('years_unit', 'Yrs')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="50" 
                    step="5"
                    value={compoundingYears} 
                    onChange={e => setCompoundingYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: T.gold }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                    <span>{t('estimated_annual_yield', 'Estimated Annual Yield')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{expectedYield}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="4" 
                    max="15" 
                    step="0.5"
                    value={expectedYield} 
                    onChange={e => setExpectedYield(Number(e.target.value))}
                    style={{ width: '100%', accentColor: T.gold }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Big Result Card */}
          <div style={{ 
            background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'center',
            marginTop: '10px'
          }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em' }}>
              {t('projected_dynastic_corpus', 'Projected Dynastic Wealth Corpus')}
            </span>
            <div style={{ fontFamily: 'var(--fn)', fontSize: '2.4rem', fontWeight: 700, color: T.gold, letterSpacing: '-0.03em', margin: '4px 0' }}>
              {fmt(projectedValue)}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {t('projected_corpus_desc', 'Monthly investment compounding at {yield}% annually over {years} years.').replace('{yield}', expectedYield).replace('{years}', compoundingYears)}
            </p>
          </div>

          {!isSimulatedLinked && (
            <div className="glass-lock-screen" style={{ borderRadius: '24px' }}>
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">{t('dynasty_trust_calc_lock', '🔒 Dynastic Trust Calculator')}</h4>
                <p className="lock-desc">{t('dynasty_lock_desc', 'Please simulate active partner link or verify status to enable trust compounding metrics.')}</p>
              </div>
            </div>
          )}
        </Card>

        {/* SECTION 2: INTERACTIVE FAMILY TREE BUILDER */}
        <Card style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} style={{ color: T.gold }} /> {t('visual_heir_mapping', 'Visual Heir Mapping')}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {t('total_allocation_percent', 'Total: {percent}%').replace('{percent}', totalAllocation)}
            </span>
          </div>
          <div className="card-heading" style={{ fontSize: '1.3rem' }}>{t('interactive_dynasty_tree', 'Interactive Dynasty Tree')}</div>
          <div className="card-sub" style={{ marginBottom: '16px' }}>{t('interactive_dynasty_tree_desc', 'Click nodes to define successor parameters or adjust split.')}</div>

          {/* Visual Heir Nodes Canvas */}
          <div style={{
            background: theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.01)',
            border: '1px dashed var(--border)',
            borderRadius: '18px',
            padding: '16px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            minHeight: '220px',
            position: 'relative'
          }}>
            {/* Parent Node */}
            <div style={{
              background: 'linear-gradient(135deg, var(--bg-muted) 0%, var(--bg) 100%)',
              border: `2px solid ${T.gold}`,
              borderRadius: '16px',
              padding: '10px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: 'var(--sh-sm)',
              zIndex: 2
            }}>
              <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em' }}>
                {t('co_trustee_root_node', 'Co-Trustee Root Node')}
              </span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                {partner1?.name || t('you_label', 'You')} &amp; {isSimulatedLinked ? (partner2?.name || 'Sophia') : t('sophia_pending_label', 'Sophia (Pending)')}
              </div>
            </div>

            {/* Tree Branch SVG Line */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              {/* Vertical trunk line */}
              <line x1="50%" y1="52px" x2="50%" y2="92px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              {/* Horizontal branch line */}
              <line x1="15%" y1="92px" x2="85%" y2="92px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              {/* Connector drops */}
              <line x1="15%" y1="92px" x2="15%" y2="114px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              <line x1="50%" y1="92px" x2="50%" y2="114px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
              <line x1="85%" y1="92px" x2="85%" y2="114px" stroke="var(--border)" strokeWidth="2" strokeDasharray="3" />
            </svg>

            {/* Successor Nodes Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', gap: '8px', marginTop: '36px', zIndex: 2 }}>
              {children.map(child => {
                const isSelected = child.id === selectedChildId;
                return (
                  <div 
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    style={{
                      background: isSelected 
                        ? (theme === 'dark' ? 'rgba(184, 144, 42, 0.12)' : 'rgba(184, 144, 42, 0.06)')
                        : 'var(--bg-muted)',
                      border: isSelected 
                        ? `2px solid ${T.gold}`
                        : '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 4px 12px ${T.gold}15` : 'none'
                    }}
                  >
                    <GraduationCap size={15} style={{ color: isSelected ? T.gold : 'var(--text-faint)', marginBottom: '4px' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {child.name === 'Grandchildren Trust' ? t('grandchildren_trust', 'Grandchildren Trust') : child.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: isSelected ? T.gold : 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                      {t('percent_split', '{percent}% Split').replace('{percent}', child.allocation)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Add Heir Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.6fr 0.6fr auto', gap: '6px', marginTop: '12px' }}>
            <input 
              className="goal-input" 
              style={{ marginBottom: 0, fontSize: '0.75rem' }} 
              type="text" 
              placeholder={t('heir_name_placeholder', 'Name...')} 
              value={newHeirName} 
              disabled={!isSimulatedLinked}
              onChange={e => setNewHeirName(e.target.value)}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0, fontSize: '0.75rem' }} 
              type="number" 
              placeholder={t('heir_age_placeholder', 'Age')} 
              value={newHeirAge} 
              disabled={!isSimulatedLinked}
              onChange={e => setNewHeirAge(Number(e.target.value))}
            />
            <input 
              className="goal-input" 
              style={{ marginBottom: 0, fontSize: '0.75rem' }} 
              type="number" 
              placeholder={t('heir_percent_placeholder', '%')} 
              value={newHeirAllocation} 
              disabled={!isSimulatedLinked}
              onChange={e => setNewHeirAllocation(Number(e.target.value))}
            />
            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 12px', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={addHeirNode}
              disabled={!isSimulatedLinked}
            >
              <Plus size={14} />
            </button>
          </div>

          {!isSimulatedLinked && (
            <div className="glass-lock-screen" style={{ borderRadius: '24px' }}>
              <div className="lock-screen-inner">
                <div className="lock-icon-glow" style={{ color: T.gold, background: 'var(--gold-pale)' }}>
                  <Lock size={20} />
                </div>
                <h4 className="lock-title">{t('family_heir_node_map_lock', '🔒 Family Heir Node Map')}</h4>
                <p className="lock-desc">{t('dynasty_lock_desc', 'Please simulate active partner link or verify status to enable trust compounding metrics.')}</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Succession Sliders & Rules Section */}
      <div className="grid-2 mt-20" style={{ gap: '24px', alignItems: 'stretch' }}>
        
        {/* SUCCESSOR PLANNING DETAILS */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Key size={15} style={{ color: T.gold }} /> {t('successor_legacy_params', 'Successor Legacy Parameters')}
          </div>
          <div className="card-heading" style={{ fontSize: '1.3rem' }}>{t('allocation_for_name', 'Allocation for: {name}').replace('{name}', selectedChild.name === 'Grandchildren Trust' ? t('grandchildren_trust', 'Grandchildren Trust') : selectedChild.name)}</div>
          <div className="card-sub" style={{ marginBottom: '18px' }}>{t('manage_locking_thresholds', 'Manage locking thresholds and trust fund payouts.')}</div>

          {/* Allocation control */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>{t('estate_split_allocation', 'Estate Split Allocation')}</span>
              <span style={{ fontWeight: 800, color: T.gold }}>{selectedChild.allocation}%</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={selectedChild.allocation}
                disabled={!isSimulatedLinked}
                onChange={e => handleAllocationChange(selectedChild.id, e.target.value)}
                style={{ flexGrow: 1, accentColor: T.gold }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{t('normalized_total_100', 'Normalized (Total 100%)')}</span>
            </div>
          </div>

          {/* Rules and Lock thresholds */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
            <div style={{ 
              background: 'var(--bg-muted)', 
              borderRadius: '14px', 
              padding: '12px 16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t('vesting_age_lock_trigger', 'Vesting Age Lock Trigger')}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('release_funds_desc', 'Release funds to heir upon reaching target age.')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="number" 
                    value={selectedChild.releaseAge} 
                    disabled={!isSimulatedLinked}
                    onChange={e => {
                      const ageVal = Number(e.target.value);
                      setChildren(children.map(c => c.id === selectedChild.id ? { ...c, releaseAge: ageVal } : c));
                    }}
                    style={{ width: '45px', padding: '4px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.75rem', textAlign: 'center', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t('years_old_unit', 'Years Old')}</span>
                </div>
              </div>
            </div>

            {/* Custom Milestone Release Rule */}
            <div style={{ 
              background: 'var(--bg-muted)', 
              borderRadius: '14px', 
              padding: '12px 16px',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t('milestone_payout_qualifier', 'Milestone Payout Qualifier')}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{t('milestone_conditions_desc', 'Additional trigger conditions for early partial releases.')}</div>
                </div>
                <select
                  value={selectedChild.milestone}
                  disabled={!isSimulatedLinked}
                  onChange={e => {
                    const mVal = e.target.value;
                    setChildren(children.map(c => c.id === selectedChild.id ? { ...c, milestone: mVal } : c));
                  }}
                  style={{
                    padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)'
                  }}
                >
                  <option value="Graduation">{t('graduation_day_option', 'Graduation Day')}</option>
                  <option value="Marriage">{t('marriage_deed_option', 'Marriage Deed')}</option>
                  <option value="First Home">{t('first_home_option', 'First Home purchase')}</option>
                  <option value="Age Threshold">{t('age_threshold_option', 'Age Threshold Only')}</option>
                </select>
              </div>
            </div>

            {/* Warning if allocations don't equal 100 */}
            {totalAllocation !== 100 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: T.rose, fontSize: '0.72rem', marginTop: '4px' }}>
                <Info size={12} />
                <span>{t('legacy_distribution_warning', 'Legacy Distribution sum is currently {percent}%. We recommend balancing to 100%.').replace('{percent}', totalAllocation)}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button 
              className="btn-primary" 
              style={{ background: T.gold, fontSize: '0.75rem', padding: '8px 16px', flexGrow: 1, borderRadius: '12px' }}
              onClick={() => alert(t('locked_instructions_alert', 'Locked estate instructions for {name} updated. Triggers registered.').replace('{name}', selectedChild.name === 'Grandchildren Trust' ? t('grandchildren_trust', 'Grandchildren Trust') : selectedChild.name))}
              disabled={!isSimulatedLinked}
            >
              {t('lock_instructions_btn', 'Lock Instructions')}
            </button>
            <button 
              style={{ background: 'transparent', border: `1px solid var(--border)`, color: T.rose, fontSize: '0.75rem', padding: '8px 12px', borderRadius: '12px', cursor: isSimulatedLinked ? 'pointer' : 'default' }}
              onClick={() => removeHeirNode(selectedChild.id)}
              disabled={!isSimulatedLinked || children.length <= 1}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </Card>

        {/* ESTATE VAULT & GOVERNANCE RULES */}
        <Card style={{ display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} style={{ color: T.gold }} /> {t('trust_governance_vault', 'Trust Governance & Estate Vault')}
          </div>
          <div className="card-heading" style={{ fontSize: '1.3rem' }}>{t('dynamic_estate_rules', 'Dynamic Estate Ledger Rules')}</div>
          <div className="card-sub" style={{ marginBottom: '16px' }}>{t('secure_storage_documents_desc', 'Secure storage of verified documents with dual trustee approvals.')}</div>

          {/* Governance Rules Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', background: 'var(--bg-warm)', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={14} style={{ color: T.gold }} />
                <span>{t('require_dual_parent_signatures', 'Require Dual-Parent Signatures')}</span>
              </div>
              <button 
                onClick={() => setRequireDualSignature(!requireDualSignature)}
                disabled={!isSimulatedLinked}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: requireDualSignature ? T.gold : 'var(--text-faint)' }}
              >
                {requireDualSignature ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </button>
            </div>
          </div>

          {/* Secure Document List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '2px' }}>
              {t('encrypted_documents_count', 'Encrypted Documents ({count})').replace('{count}', documents.length)}
            </span>
            {documents.map(doc => (
              <div key={doc.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-muted)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name === 'Last Will & Testament.pdf' ? t('doc_will_pdf', 'Last Will & Testament.pdf') : doc.name === 'Family Living Trust Agreement.pdf' ? t('doc_trust_pdf', 'Family Living Trust Agreement.pdf') : doc.name === 'Asset Distribution Ledger.xlsx' ? t('doc_ledger_xlsx', 'Asset Distribution Ledger.xlsx') : doc.name === 'Multi-Gen Power of Attorney.pdf' ? t('doc_poa_pdf', 'Multi-Gen Power of Attorney.pdf') : doc.name}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)' }}>
                      {t('doc_size_saved_date', '{size} · Saved {date}').replace('{size}', doc.size).replace('{date}', doc.date)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => toggleDocumentSign(doc.id)}
                    disabled={!isSimulatedLinked}
                    style={{
                      background: doc.signed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: 'none',
                      color: doc.signed ? '#10b981' : '#ef4444',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: isSimulatedLinked ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {doc.signed ? <Check size={10} strokeWidth={3} /> : <Lock size={10} />}
                    {doc.signed ? t('signed_status', 'Signed') : t('unlock_status', 'Unlock')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            className="btn-primary" 
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.75rem', padding: '10px', borderRadius: '12px', marginTop: '12px' }}
            onClick={() => alert(t('secure_upload_alert', 'Secure document upload initialized. Files will be locally encrypted.'))}
            disabled={!isSimulatedLinked}
          >
            {t('upload_new_trust_btn', '+ Upload New Trust Agreement')}
          </button>
        </Card>
      </div>

      {/* Invite QR Code Modal Section */}
      <Card style={{ marginTop: '24px', padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, var(--bg-muted) 0%, var(--bg) 100%)', border: `1px solid var(--border)` }}>
        <div style={{ flex: '1 1 300px' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={18} style={{ color: T.gold }} /> {t('multigen_dynasty_linking', 'Multi-Generation Dynasty Linking')}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {t('multigen_linking_desc', 'Provide immediate legacy access to direct beneficiaries, co-trustees, or generational financial advisors by generating secure pairing invites.')}
          </p>
        </div>
        <div>
          <button 
            className="btn-primary" 
            style={{ background: T.gold, fontSize: '0.78rem', padding: '10px 20px', width: 'auto', borderRadius: '12px' }}
            onClick={() => setShowQRModal(true)}
          >
            {t('launch_invite_interface_btn', 'Launch Invite Interface')}
          </button>
        </div>
      </Card>

      {/* QR MODAL DIALOG */}
      {showQRModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg)',
            border: `1px solid var(--border)`,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: 'var(--sh-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700
              }}
            >
              &times;
            </button>

            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px', textAlign: 'center' }}>
              {t('pair_legacy_node', 'Pair Legacy Node')}
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
              {t('scan_pairing_desc', 'Scan to authorize read-only ledger pairing or co-trustee signature credentials.')}
            </p>

            {/* Invite Role Picker */}
            <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-muted)', padding: '4px', borderRadius: '10px', width: '100%', marginBottom: '16px' }}>
              <button 
                onClick={() => setQrInviteRole('successor')}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '8px', border: 'none',
                  background: qrInviteRole === 'successor' ? 'var(--bg)' : 'transparent',
                  color: qrInviteRole === 'successor' ? T.gold : 'var(--text-muted)',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {t('heir_successor_btn', 'Heir / Successor')}
              </button>
              <button 
                onClick={() => setQrInviteRole('co-trustee')}
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '8px', border: 'none',
                  background: qrInviteRole === 'co-trustee' ? 'var(--bg)' : 'transparent',
                  color: qrInviteRole === 'co-trustee' ? T.gold : 'var(--text-muted)',
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {t('co_trustee_btn', 'Co-Trustee')}
              </button>
            </div>

            {/* Visual Simulated QR Code Box */}
            <div style={{
              background: '#fff',
              border: `2px solid ${T.gold}`,
              borderRadius: '20px',
              padding: '16px',
              width: '180px',
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
            }}>
              {/* Nice simulated SVG QR code */}
              <svg width="140" height="140" viewBox="0 0 100 100" style={{ fill: '#0f141e' }}>
                <rect x="0" y="0" width="25" height="25" fill="none" stroke="#0f141e" strokeWidth="6" />
                <rect x="6" y="6" width="13" height="13" />
                <rect x="75" y="0" width="25" height="25" fill="none" stroke="#0f141e" strokeWidth="6" />
                <rect x="81" y="6" width="13" height="13" />
                <rect x="0" y="75" width="25" height="25" fill="none" stroke="#0f141e" strokeWidth="6" />
                <rect x="6" y="81" width="13" height="13" />
                
                {/* Random blocks to simulate QR */}
                <rect x="35" y="5" width="8" height="8" />
                <rect x="50" y="15" width="12" height="6" />
                <rect x="35" y="35" width="16" height="8" />
                <rect x="10" y="45" width="14" height="12" />
                <rect x="65" y="35" width="8" height="14" />
                <rect x="80" y="50" width="12" height="12" />
                <rect x="45" y="65" width="14" height="8" />
                <rect x="35" y="80" width="8" height="15" />
                <rect x="55" y="80" width="16" height="10" />
                
                {/* Center logo lock */}
                <rect x="42" y="42" width="16" height="16" rx="4" fill={T.gold} />
                <path d="M47 53.5h6v-3h-6zm0-5v2h6v-2z" fill="#fff" />
              </svg>
            </div>

            {/* Invite Info */}
            <div style={{ marginTop: '16px', width: '100%', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                {t('invite_pairing_code', 'Invite Pairing Code')}
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: T.gold, marginTop: '2px', background: 'var(--bg-muted)', padding: '6px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                {invitationCode}
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ background: T.gold, fontSize: '0.78rem', padding: '10px', width: '100%', borderRadius: '12px', marginTop: '16px' }}
              onClick={() => {
                alert(t('pairing_code_copied_alert', 'Invite pairing code copied to clipboard: {code}').replace('{code}', invitationCode));
                setShowQRModal(false);
              }}
            >
              {t('copy_link_close_btn', 'Copy Link & Close')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
