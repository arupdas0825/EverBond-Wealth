import os

file_path = r"c:\Users\Lenovo\everbond-wealth\src\components\partner\PartnerPage.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import and hook initialization
old_import = """import { useToast } from '../common/Toast';
import { Card } from '../common/Card';"""

new_import = """import { useToast } from '../common/Toast';
import { Card } from '../common/Card';
import { useTranslation } from '../../utils/i18n';"""

content = content.replace(old_import, new_import)

old_hook = """export function PartnerPage({ setPage, connectCode }) {
  const toast = useToast();"""

new_hook = """export function PartnerPage({ setPage, connectCode }) {
  const toast = useToast();
  const { t } = useTranslation();"""

content = content.replace(old_hook, new_hook)

# 2. Toast and scan error replacements
replacements = [
    ('toast.success("Partner connected successfully!");', 'toast.success(t(\'partner_connected_success\', \'Partner connected successfully!\'));'),
    ('toast.error("User session not found. Please log in again.");', 'toast.error(t(\'user_session_not_found\', \'User session not found. Please log in again.\'));'),
    ('toast.error("Failed to generate invitation. Please try again.");', 'toast.error(t(\'failed_generate_invite\', \'Failed to generate invitation. Please try again.\'));'),
    ('toast.error("You cannot connect to yourself.");', 'toast.error(t(\'cannot_connect_self\', \'You cannot connect to yourself.\'));'),
    ('toast.error(`This invitation has already been ${inviteData.status}.`);', "toast.error(t('invite_already_status', 'This invitation has already been {status}.').replace('{status}', t(inviteData.status, inviteData.status)));"),
    ('toast.error("This invitation has expired.");', "toast.error(t('invite_expired', 'This invitation has expired.'));"),
    ('toast.error("You cannot accept your own invitation.");', "toast.error(t('cannot_accept_own', 'You cannot accept your own invitation.'));"),
    ('toast.error("Invitation code or Partner EverBond ID not found.");', "toast.error(t('invite_code_not_found', 'Invitation code or Partner EverBond ID not found.'));"),
    ('toast.error("This partner is already connected to another user.");', "toast.error(t('partner_already_connected', 'This partner is already connected to another user.'));"),
    ('toast.error("Failed to validate code. Please try again.");', "toast.error(t('failed_validate_code', 'Failed to validate code. Please try again.'));"),
    ('toast.success("Workspace connected successfully!");', "toast.success(t('workspace_connected_success', 'Workspace connected successfully!'));"),
    ('toast.error("Failed to connect workspace. Please try again.");', "toast.error(t('failed_connect_workspace', 'Failed to connect workspace. Please try again.'));"),
    ('toast.success("Workspace disconnected.");', "toast.success(t('workspace_disconnected', 'Workspace disconnected.'));"),
    ('toast.error("Failed to disconnect workspace.");', "toast.error(t('failed_disconnect_workspace', 'Failed to disconnect workspace.'));"),
    ("setScanError('Camera Access Denied: Please check permissions or type code manually.');", "setScanError(t('camera_access_denied', 'Camera Access Denied: Please check permissions or type code manually.'));"),
    ("toast.error('Invalid EverBond invitation QR scanned.');", "toast.error(t('invalid_qr_scanned', 'Invalid EverBond invitation QR scanned.'));"),
    ("if (!emailStr) return '***@gmail.com';", "if (!emailStr) return t('mask_email_placeholder', '***@gmail.com');"),
    ('toast.success("Link copied to clipboard!");', 'toast.success(t(\'link_copied\', \'Link copied to clipboard!\'));'),
    ('toast.success("Shared successfully!");', 'toast.success(t(\'shared_successfully\', \'Shared successfully!\'));'),
    ('toast.success("Link copied! Share API not supported on this device.");', 'toast.success(t(\'link_copied_fallback\', \'Link copied! Share API not supported on this device.\'));'),
]

for old, new in replacements:
    content = content.replace(old, new)

# 3. Localize rendering JSX blocks
# Success Screen
old_success = """          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
            Partner Workspace Activated
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
            Your financial nodes have successfully established connection. You can now plan, save, and grow your dynastic wealth together.
          </p>

          <button
            onClick={() => {
              setShowSuccessScreen(false);
              setPage('dashboard');
            }}
            className="onb-btn-continue"
            style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
          >
            Open Workspace
          </button>"""

new_success = """          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--text)' }}>
            {t('partner_workspace_activated', 'Partner Workspace Activated')}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '32px' }}>
            {t('partner_activated_desc', 'Your financial nodes have successfully established connection. You can now plan, save, and grow your dynastic wealth together.')}
          </p>

          <button
            onClick={() => {
              setShowSuccessScreen(false);
              setPage('dashboard');
            }}
            className="onb-btn-continue"
            style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
          >
            {t('open_workspace', 'Open Workspace')}
          </button>"""

content = content.replace(old_success, old_success if old_success not in content else new_success)

# Active connected state header & param card
old_active = """        <div className="page-header" style={{ marginBottom: '32px' }}>
          <div className="page-eyebrow">Connection Workspace</div>
          <h1 className="page-title">Active <em>Connection</em></h1>
          <p className="page-desc">Your workspace is connected to your partner node in committed planning mode.</p>
        </div>"""

new_active = """        <div className="page-header" style={{ marginBottom: '32px' }}>
          <div className="page-eyebrow">{t('connection_workspace', 'Connection Workspace')}</div>
          <h1 className="page-title">{t('active', 'Active')} <em>{t('connection', 'Connection')}</em></h1>
          <p className="page-desc">{t('connection_active_desc', 'Your workspace is connected to your partner node in committed planning mode.')}</p>
        </div>"""

content = content.replace(old_active, new_active)

old_params = """            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em', display: 'block', marginBottom: '16px' }}>
              Connection Parameters
            </span>"""

new_params = """            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.08em', display: 'block', marginBottom: '16px' }}>
              {t('connection_parameters', 'Connection Parameters')}
            </span>"""

content = content.replace(old_params, new_params)

old_fields = """                <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Connected Stage</span>
                  <strong style={{ fontSize: '0.9rem', color: T.gold }}>{stage} Planning</strong>
                </div>
                <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Workspace Status</span>
                  <strong style={{ fontSize: '0.9rem', color: T.sage }}>● Active</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Partner Node Identity</span>"""

new_fields = """                <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{t('connected_stage', 'Connected Stage')}</span>
                  <strong style={{ fontSize: '0.9rem', color: T.gold }}>{t(stage.toLowerCase(), stage)} {t('planning', 'Planning')}</strong>
                </div>
                <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{t('workspace_status', 'Workspace Status')}</span>
                  <strong style={{ fontSize: '0.9rem', color: T.sage }}>● {t('active_status', 'Active')}</strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{t('partner_node_identity', 'Partner Node Identity')}</span>"""

content = content.replace(old_fields, new_fields)

# Danger zone
old_danger = """          <Card style={{ border: '1px solid var(--rose-border)', background: 'rgba(208, 92, 114, 0.02)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose)', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Danger Zone
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45 }}>
              Severing this node connection will immediately deactivate your shared workspace. Personal assets and targets will return to independent command.
            </p>"""

new_danger = """          <Card style={{ border: '1px solid var(--rose-border)', background: 'rgba(208, 92, 114, 0.02)' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--rose)', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              {t('danger_zone', 'Danger Zone')}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.45 }}>
              {t('sever_connection_warning', 'Severing this node connection will immediately deactivate your shared workspace. Personal assets and targets will return to independent command.')}
            </p>"""

content = content.replace(old_danger, new_danger)

old_danger_confirm = """              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Are you absolutely sure?</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                  Both nodes will immediately revert to Single stage workspaces. Shared ledgers will be locked.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDisconnectNode}
                    disabled={isDisconnecting}
                    className="btn-primary"
                    style={{ background: 'var(--rose)', color: '#fff', fontSize: '0.75rem', padding: '8px 16px', width: 'auto', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Yes, Disconnect Node'}
                  </button>
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="btn-secondary"
                style={{
                  color: 'var(--rose)', borderColor: 'var(--rose-border)', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.8rem', padding: '10px 18px', width: 'auto', borderRadius: '100px'
                }}
              >
                <LogOut size={14} /> Disconnect Workspace
              </button>"""

new_danger_confirm = """              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>{t('are_you_sure', 'Are you absolutely sure?')}</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                  {t('sever_confirm_desc', 'Both nodes will immediately revert to Single stage workspaces. Shared ledgers will be locked.')}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDisconnectNode}
                    disabled={isDisconnecting}
                    className="btn-primary"
                    style={{ background: 'var(--rose)', color: '#fff', fontSize: '0.75rem', padding: '8px 16px', width: 'auto', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  >
                    {isDisconnecting ? t('disconnecting', 'Disconnecting...') : t('confirm_disconnect', 'Yes, Disconnect Node')}
                  </button>
                  <button
                    onClick={() => setShowDisconnectConfirm(false)}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '8px' }}
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="btn-secondary"
                style={{
                  color: 'var(--rose)', borderColor: 'var(--rose-border)', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.8rem', padding: '10px 18px', width: 'auto', borderRadius: '100px'
                }}
              >
                <LogOut size={14} /> {t('disconnect_workspace', 'Disconnect Workspace')}
              </button>"""

content = content.replace(old_danger_confirm, new_danger_confirm)

# Acceptance flow
old_accept_flow = """          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
            Establish Node Connection
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            You are connecting with a partner workspace to unlock shared wealth management tools.
          </p>

          <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              Partner Node Profile
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <strong style={{ color: 'var(--text)' }}>{incomingInvite.creatorName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <strong style={{ color: 'var(--text)' }}>{maskEmail(incomingInvite.creatorEmail)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Invite Code:</span>
                <strong style={{ fontFamily: 'monospace', color: T.gold }}>{incomingInvite.inviteCode}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', marginBottom: '28px' }}>
            <input
              type="checkbox"
              id="accept-consent"
              checked={acceptChecked}
              onChange={(e) => setAcceptChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="accept-consent" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              I agree to establish a shared partner workspace and understand that co-trustee allocations will be synchronized.
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAcceptConnection}
              disabled={!acceptChecked || isConnecting}
              className="onb-btn-continue"
              style={{
                flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem',
                opacity: (acceptChecked && !isConnecting) ? 1 : 0.6
              }}
            >
              {isConnecting ? 'Activating...' : 'Accept Connection'}
            </button>
            <button
              onClick={() => {
                setIncomingInvite(null);
                setConnectCode(null);
              }}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
          </div>"""

new_accept_flow = """          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>
            {t('establish_node_connection', 'Establish Node Connection')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
            {t('establish_connection_desc', 'You are connecting with a partner workspace to unlock shared wealth management tools.')}
          </p>

          <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: T.gold, letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              {t('partner_node_profile', 'Partner Node Profile')}
            </span>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('name_label', 'Name:')}</span>
                <strong style={{ color: 'var(--text)' }}>{incomingInvite.creatorName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('email_label', 'Email:')}</span>
                <strong style={{ color: 'var(--text)' }}>{maskEmail(incomingInvite.creatorEmail)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('invite_code_label', 'Invite Code:')}</span>
                <strong style={{ fontFamily: 'monospace', color: T.gold }}>{incomingInvite.inviteCode}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left', marginBottom: '28px' }}>
            <input
              type="checkbox"
              id="accept-consent"
              checked={acceptChecked}
              onChange={(e) => setAcceptChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="accept-consent" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              {t('establish_connection_consent', 'I agree to establish a shared partner workspace and understand that co-trustee allocations will be synchronized.')}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleAcceptConnection}
              disabled={!acceptChecked || isConnecting}
              className="onb-btn-continue"
              style={{
                flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem',
                opacity: (acceptChecked && !isConnecting) ? 1 : 0.6
              }}
            >
              {isConnecting ? t('activating', 'Activating...') : t('accept_connection', 'Accept Connection')}
            </button>
            <button
              onClick={() => {
                setIncomingInvite(null);
                setConnectCode(null);
              }}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              {t('cancel', 'Cancel')}
            </button>
          </div>"""

content = content.replace(old_accept_flow, new_accept_flow)

# Introduction Phase 1
old_intro = """            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              Connect Your Partner
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              Create a shared financial workspace and align your future together.
            </p>
          </div>

          {/* Benefits Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {[
              "Shared financial goals",
              "Joint milestone planning",
              "Shared insights and projections",
              "Private partner workspace"
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text)' }}>
                <span style={{ color: T.gold, fontWeight: 'bold' }}>✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Privacy Section */}
          <div style={{
            background: 'var(--bg-warm)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px', marginBottom: '28px', position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Shield size={16} style={{ color: T.gold, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Privacy & Sovereign Security</strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  Only the information you explicitly choose to share will be visible to your partner. Your personal credentials, passwords, and authentication data are never shared.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <input
              type="checkbox"
              id="consent-check"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="consent-check" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              I understand how partner workspaces function.
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => setHasConsented(true)}
              disabled={!consentChecked}
              className="onb-btn-continue"
              style={{
                flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem',
                opacity: consentChecked ? 1 : 0.6
              }}
            >
              Continue
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              Back
            </button>
          </div>"""

new_intro = """            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              {t('connect_your_partner', 'Connect Your Partner')}
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
              {t('connect_partner_promo_desc', 'Create a shared financial workspace and align your future together.')}
            </p>
          </div>

          {/* Benefits Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            {[
              t('benefit_goals', 'Shared financial goals'),
              t('benefit_milestones', 'Joint milestone planning'),
              t('benefit_insights', 'Shared insights and projections'),
              t('benefit_workspace', 'Private partner workspace')
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text)' }}>
                <span style={{ color: T.gold, fontWeight: 'bold' }}>✓</span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Privacy Section */}
          <div style={{
            background: 'var(--bg-warm)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '16px', marginBottom: '28px', position: 'relative', zIndex: 1
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Shield size={16} style={{ color: T.gold, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>{t('privacy_security_title', 'Privacy & Sovereign Security')}</strong>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  {t('privacy_security_desc', 'Only the information you explicitly choose to share will be visible to your partner. Your personal credentials, passwords, and authentication data are never shared.')}
                </p>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
            <input
              type="checkbox"
              id="consent-check"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: '3px', accentColor: T.gold }}
            />
            <label htmlFor="consent-check" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4, cursor: 'pointer' }}>
              {t('understand_workspaces_consent', 'I understand how partner workspaces function.')}
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => setHasConsented(true)}
              disabled={!consentChecked}
              className="onb-btn-continue"
              style={{
                flex: 2, padding: '12px', borderRadius: '100px', fontSize: '0.85rem',
                opacity: consentChecked ? 1 : 0.6
              }}
            >
              {t('continue_btn', 'Continue')}
            </button>
            <button
              onClick={() => setPage('dashboard')}
              className="onb-btn-back"
              style={{ flex: 1, padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
            >
              {t('back_btn', 'Back')}
            </button>
          </div>"""

content = content.replace(old_intro, new_intro)

# Phase 2 Connection Method Selection
old_selection = """          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.50rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              Choose Connection Method
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Select a method below to link workspaces with your partner.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {/* Option 1: QR Code */}
            <div
              onClick={() => handleCreateInvite('qr')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCodeIcon size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>QR Code</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scan and connect instantly.</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>

            {/* Option 2: Invitation Link */}
            <div
              onClick={() => handleCreateInvite('link')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>Invitation Link</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Share a secure invitation link.</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>

            {/* Option 3: Partner ID */}
            <div
              onClick={() => handleCreateInvite('id')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>Partner ID / Invite Code</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Enter your partner's ID or invite code.</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>
          </div>

          <button
            onClick={() => setHasConsented(false)}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            Back
          </button>"""

new_selection = """          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.50rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text)' }}>
              {t('choose_connection_method', 'Choose Connection Method')}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {t('choose_method_desc', 'Select a method below to link workspaces with your partner.')}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {/* Option 1: QR Code */}
            <div
              onClick={() => handleCreateInvite('qr')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCodeIcon size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>{t('qr_code_title', 'QR Code')}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('qr_code_desc', 'Scan and connect instantly.')}</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>

            {/* Option 2: Invitation Link */}
            <div
              onClick={() => handleCreateInvite('link')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link2 size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>{t('invitation_link_title', 'Invitation Link')}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('invitation_link_desc', 'Share a secure invitation link.')}</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>

            {/* Option 3: Partner ID */}
            <div
              onClick={() => handleCreateInvite('id')}
              style={{
                background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '16px',
                padding: '18px', display: 'flex', alignItems: 'center', justifyItems: 'space-between',
                cursor: 'pointer', transition: 'transform 0.18s, border-color 0.18s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.gold; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexGrow: 1 }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--gold-pale)', color: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>{t('partner_id_code_title', 'Partner ID / Invite Code')}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t('partner_id_code_desc', "Enter your partner's ID or invite code.")}</span>
                </div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-faint)' }} />
            </div>
          </div>

          <button
            onClick={() => setHasConsented(false)}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            {t('back_btn', 'Back')}
          </button>"""

content = content.replace(old_selection, new_selection)

# Action Screens (QR, Link, ID Details)
old_action_screens = """      {isCreatingInvite && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <RefreshCw size={36} className="skeleton-pulse" style={{ color: T.gold, margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>Generating Secure invitation...</h3>
        </Card>
      )}

      {!isCreatingInvite && (
        <Card style={{ padding: '32px 24px', textAlign: 'center' }}>
          
          {selectedMethod === 'qr' && (
            <div>
              <div style={{
                background: '#fff', padding: '16px', borderRadius: '20px',
                border: `1.5px solid ${T.gold}40`, display: 'inline-flex',
                boxShadow: '0 8px 30px rgba(184,144,42,0.1)', marginBottom: '24px'
              }}>
                <QRCode value={getInviteUrl()} size={180} fgColor="#12110E" bgColor="#FFFFFF" level="H" />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                Scan Partner Link
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.45 }}>
                Show this QR code to your partner. They can scan it with their phone camera to instantly establish the connection.
              </p>
            </div>
          )}

          {selectedMethod === 'link' && (
            <div>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--gold-pale)', color: T.gold,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: `1px solid ${T.gold}30`
              }}>
                <Link2 size={28} />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                Share Invitation Link
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.45 }}>
                Send this secure web link to your partner. When opened, it will guide them through accepting the shared workspace.
              </p>

              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 12px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1, textAlign: 'left' }}>
                  {getInviteUrl()}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getInviteUrl());
                    toast.success("Link copied to clipboard!");
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} /> Copy Link
                </button>
                <button
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'EverBond Wealth Connection',
                          text: 'Join my shared committed partner workspace on EverBond Wealth.',
                          url: getInviteUrl(),
                        });
                        toast.success("Shared successfully!");
                      } catch (err) {
                        console.log("Share failed or cancelled:", err);
                      }
                    } else {
                      navigator.clipboard.writeText(getInviteUrl());
                      toast.success("Link copied! Share API not supported on this device.");
                    }
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Share2 size={12} /> Share
                </button>
              </div>
            </div>
          )}

          {selectedMethod === 'id' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gold-pale)', color: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: `1px solid ${T.gold}30`
                }}>
                  <Key size={24} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  Partner ID & Invite Code
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  Display your generated invite code or manually type your partner's code/ID below.
                </p>
              </div>

              {/* Display Generated Invite Code */}
              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Your Invite Code</span>
                <strong style={{ fontSize: '1.4rem', color: T.gold, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{createdInviteCode || 'EB-XXXXXX'}</strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>Provide this code to your partner to enter on their screen</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label htmlFor="code-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Enter Partner's Code or EverBond ID
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="code-input"
                      type="text"
                      className="onb-input-glow"
                      placeholder="e.g. EB-AB12CD"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      style={{ flexGrow: 1, padding: '10px 14px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={handleStartScanWorkflow}
                      className="btn-secondary"
                      title="Scan QR Code"
                      style={{ padding: '0 12px', border: '1px solid var(--border-mid)', borderRadius: '10px' }}
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>
                    Format: EB-XXXXXX
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleValidateCode(manualCodeInput)}
                disabled={!manualCodeInput.trim() || isValidatingCode}
                className="onb-btn-continue"
                style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.88rem', opacity: manualCodeInput.trim() ? 1 : 0.6, marginBottom: '12px' }}
              >
                {isValidatingCode ? 'Checking...' : 'Connect Workspace'}
              </button>
            </div>
          )}

          {/* Pulse Waiting Status Indicator for QR & Link Creators */}
          {(selectedMethod === 'qr' || selectedMethod === 'link') && (
            <div style={{
              background: 'rgba(184, 144, 42, 0.05)', border: `1px dashed ${T.gold}40`,
              borderRadius: '16px', padding: '16px', marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="eb-pulse-dot gold" style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.gold, display: 'inline-block' }} />
                <strong style={{ fontSize: '0.88rem', color: T.gold }}>Waiting for your partner...</strong>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginTop: '6px' }}>
                Code: <strong style={{ fontFamily: 'monospace' }}>{createdInviteCode}</strong>
              </span>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => {
              setSelectedMethod(null);
              setCreatedInviteCode('');
              setCreatedInviteId('');
              setManualCodeInput('');
            }}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            Back to Options
          </button>"""

new_action_screens = """      {isCreatingInvite && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <RefreshCw size={36} className="skeleton-pulse" style={{ color: T.gold, margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{t('generating_invite', 'Generating Secure invitation...')}</h3>
        </Card>
      )}

      {!isCreatingInvite && (
        <Card style={{ padding: '32px 24px', textAlign: 'center' }}>
          
          {selectedMethod === 'qr' && (
            <div>
              <div style={{
                background: '#fff', padding: '16px', borderRadius: '20px',
                border: `1.5px solid ${T.gold}40`, display: 'inline-flex',
                boxShadow: '0 8px 30px rgba(184,144,42,0.1)', marginBottom: '24px'
              }}>
                <QRCode value={getInviteUrl()} size={180} fgColor="#12110E" bgColor="#FFFFFF" level="H" />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                {t('scan_partner_link', 'Scan Partner Link')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 24px', lineHeight: 1.45 }}>
                {t('scan_partner_link_desc', 'Show this QR code to your partner. They can scan it with their phone camera to instantly establish the connection.')}
              </p>
            </div>
          )}

          {selectedMethod === 'link' && (
            <div>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--gold-pale)', color: T.gold,
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                border: `1px solid ${T.gold}30`
              }}>
                <Link2 size={28} />
              </div>
              <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                {t('share_invitation_link', 'Share Invitation Link')}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.45 }}>
                {t('share_invite_link_desc', 'Send this secure web link to your partner. When opened, it will guide them through accepting the shared workspace.')}
              </p>

              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px 12px', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1, textAlign: 'left' }}>
                  {getInviteUrl()}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getInviteUrl());
                    toast.success(t('link_copied', 'Link copied to clipboard!'));
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={12} /> {t('copy_link', 'Copy Link')}
                </button>
                <button
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'EverBond Wealth Connection',
                          text: 'Join my shared committed partner workspace on EverBond Wealth.',
                          url: getInviteUrl(),
                        });
                        toast.success(t('shared_successfully', 'Shared successfully!'));
                      } catch (err) {
                        console.log("Share failed or cancelled:", err);
                      }
                    } else {
                      navigator.clipboard.writeText(getInviteUrl());
                      toast.success(t('link_copied_fallback', 'Link copied! Share API not supported on this device.'));
                    }
                  }}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Share2 size={12} /> {t('share_btn', 'Share')}
                </button>
              </div>
            </div>
          )}

          {selectedMethod === 'id' && (
            <div style={{ textAlign: 'left' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--gold-pale)', color: T.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                  border: `1px solid ${T.gold}30`
                }}>
                  <Key size={24} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                  {t('partner_id_invite_code', 'Partner ID & Invite Code')}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                  {t('partner_id_invite_desc', 'Display your generated invite code or manually type your partner\'s code/ID below.')}
                </p>
              </div>

              {/* Display Generated Invite Code */}
              <div style={{ background: 'var(--bg-warm)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>{t('your_invite_code', 'Your Invite Code')}</span>
                <strong style={{ fontSize: '1.4rem', color: T.gold, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{createdInviteCode || t('code_placeholder', 'EB-XXXXXX')}</strong>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>{t('provide_code_desc', 'Provide this code to your partner to enter on their screen')}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label htmlFor="code-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    {t('enter_partner_code', "Enter Partner's Code or EverBond ID")}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="code-input"
                      type="text"
                      className="onb-input-glow"
                      placeholder="e.g. EB-AB12CD"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      style={{ flexGrow: 1, padding: '10px 14px', fontSize: '0.88rem', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={handleStartScanWorkflow}
                      className="btn-secondary"
                      title="Scan QR Code"
                      style={{ padding: '0 12px', border: '1px solid var(--border-mid)', borderRadius: '10px' }}
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', display: 'block', marginTop: '4px' }}>
                    {t('format_placeholder', 'Format: EB-XXXXXX')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleValidateCode(manualCodeInput)}
                disabled={!manualCodeInput.trim() || isValidatingCode}
                className="onb-btn-continue"
                style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.88rem', opacity: manualCodeInput.trim() ? 1 : 0.6, marginBottom: '12px' }}
              >
                {isValidatingCode ? t('checking', 'Checking...') : t('connect_workspace', 'Connect Workspace')}
              </button>
            </div>
          )}

          {/* Pulse Waiting Status Indicator for QR & Link Creators */}
          {(selectedMethod === 'qr' || selectedMethod === 'link') && (
            <div style={{
              background: 'rgba(184, 144, 42, 0.05)', border: `1px dashed ${T.gold}40`,
              borderRadius: '16px', padding: '16px', marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="eb-pulse-dot gold" style={{ width: '10px', height: '10px', borderRadius: '50%', background: T.gold, display: 'inline-block' }} />
                <strong style={{ fontSize: '0.88rem', color: T.gold }}>{t('waiting_partner', 'Waiting for your partner...')}</strong>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', display: 'block', marginTop: '6px' }}>
                Code: <strong style={{ fontFamily: 'monospace' }}>{createdInviteCode}</strong>
              </span>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={() => {
              setSelectedMethod(null);
              setCreatedInviteCode('');
              setCreatedInviteId('');
              setManualCodeInput('');
            }}
            className="onb-btn-back"
            style={{ width: '100%', padding: '12px', borderRadius: '100px', fontSize: '0.85rem' }}
          >
            {t('back_to_options', 'Back to Options')}
          </button>"""

content = content.replace(old_action_screens, new_action_screens)

# Scanning overlay
old_scanner = """            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>
              Scan Invitation QR
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
              Align the QR code on your partner's screen within the viewfinder.
            </p>

            <div style={{
              width: '240px', height: '240px', borderRadius: '16px', border: `3px solid ${T.gold}`,
              margin: '0 auto 20px', position: 'relative', overflow: 'hidden', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              {isScanning ? (
                <>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="camera-laser" style={{ position: 'absolute', left: 0, width: '100%', height: '3px', background: T.gold, boxShadow: `0 0 10px ${T.gold}` }} />
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '16px', fontSize: '0.8rem' }}>
                  {scanError || 'Starting Camera stream...'}
                </div>
              )}
            </div>
            
            <button
              onClick={handleCloseScanner}
              className="btn-secondary"
              style={{ width: 'auto', padding: '8px 20px', borderRadius: '100px', fontSize: '0.78rem' }}
            >
              Cancel
            </button>"""

new_scanner = """            <h3 style={{ fontFamily: T.fontDisplay, fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text)' }}>
              {t('scan_invitation_qr', 'Scan Invitation QR')}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
              {t('align_qr_desc', "Align the QR code on your partner's screen within the viewfinder.")}
            </p>

            <div style={{
              width: '240px', height: '240px', borderRadius: '16px', border: `3px solid ${T.gold}`,
              margin: '0 auto 20px', position: 'relative', overflow: 'hidden', background: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              {isScanning ? (
                <>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="camera-laser" style={{ position: 'absolute', left: 0, width: '100%', height: '3px', background: T.gold, boxShadow: `0 0 10px ${T.gold}` }} />
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '16px', fontSize: '0.8rem' }}>
                  {scanError || t('starting_camera', 'Starting Camera stream...')}
                </div>
              )}
            </div>
            
            <button
              onClick={handleCloseScanner}
              className="btn-secondary"
              style={{ width: 'auto', padding: '8px 20px', borderRadius: '100px', fontSize: '0.78rem' }}
            >
              {t('cancel', 'Cancel')}
            </button>"""

content = content.replace(old_scanner, new_scanner)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS")
