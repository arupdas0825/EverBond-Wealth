import os

file_path = r"c:\Users\Lenovo\everbond-wealth\src\components\welcome\FamilyPlanningPage.jsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
old_import = "import { formatCurrency, formatCompact } from '../../utils/finance';"
new_import = """import { formatCurrency, formatCompact } from '../../utils/finance';
import { useTranslation } from '../../utils/i18n';"""

content = content.replace(old_import, new_import)

# 2. Hook and destructuring (including theme and useTranslation)
old_destruct = """  const { 
    partner1, 
    partner2, 
    currency, 
    getTotalSalary, 
    partnerAccepted,
    relationshipStage,
    stage,
    partnerLinked,
    familyWorkspaceId
  } = useFinanceStore();"""

new_destruct = """  const { 
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
  
  const { t } = useTranslation();"""

content = content.replace(old_destruct, new_destruct)

# 3. toast messages replacements
replacements = [
    ('toast.error("User session not found. Please log in again.");', 'toast.error(t(\'user_session_not_found\', \'User session not found. Please log in again.\'));'),
    ('toast.error("Please provide a name for your Dynasty.");', 'toast.error(t(\'please_provide_dynasty_name\', \'Please provide a name for your Dynasty.\'));'),
    ('toast.success("Family Dynasty Workspace activated!");', 'toast.success(t(\'dynasty_activated_success\', \'Family Dynasty Workspace activated!\'));'),
    ('toast.error("Failed to activate Dynasty Workspace.");', 'toast.error(t(\'failed_activate_dynasty\', \'Failed to activate Dynasty Workspace.\'));'),
    ('toast.success("Successfully joined Family Dynasty!");', 'toast.success(t(\'joined_dynasty_success\', \'Successfully joined Family Dynasty!\'));'),
    ('toast.error("Failed to join Dynasty workspace.");', 'toast.error(t(\'failed_join_dynasty\', \'Failed to join Dynasty workspace.\'));'),
    ('toast.success("Code copied to clipboard!");', 'toast.success(t(\'code_copied_clipboard\', \'Code copied to clipboard!\'));'),
    ('toast.success("Link copied!");', 'toast.success(t(\'link_copied\', \'Link copied!\'));'),
    ('toast.success("Shared successfully!");', 'toast.success(t(\'shared_successfully\', \'Shared successfully!\'));'),
]

for old, new in replacements:
    content = content.replace(old, new)

# 4. rolesConfig replacement
old_roles = """  const rolesConfig = [
    { id: 'Founder', title: 'Founder', desc: 'Creator & primary trustee. Complete control over governance & heir allocations.' },
    { id: 'Parent', title: 'Parent', desc: 'Joint manager of the asset pool. Coordinate milestone planning and projections.' },
    { id: 'Spouse', title: 'Spouse', desc: 'Joint co-trustee. Unified portfolio tracking & dual signatures.' },
    { id: 'Child', title: 'Child', desc: 'Heir & beneficiary. View-only access to trust fund release conditions.' },
    { id: 'Advisor', title: 'Advisor', desc: 'Wealth consultant or legal manager. View-only planning access.' }
  ];"""

new_roles = """  const rolesConfig = [
    { id: 'Founder', title: t('role_founder_title', 'Founder'), desc: t('role_founder_desc', 'Creator & primary trustee. Complete control over governance & heir allocations.') },
    { id: 'Parent', title: t('role_parent_title', 'Parent'), desc: t('role_parent_desc', 'Joint manager of the asset pool. Coordinate milestone planning and projections.') },
    { id: 'Spouse', title: t('role_spouse_title', 'Spouse'), desc: t('role_spouse_desc', 'Joint co-trustee. Unified portfolio tracking & dual signatures.') },
    { id: 'Child', title: t('role_child_title', 'Child'), desc: t('role_child_desc', 'Heir & beneficiary. View-only access to trust fund release conditions.') },
    { id: 'Advisor', title: t('role_advisor_title', 'Advisor'), desc: t('role_advisor_desc', 'Wealth consultant or legal manager. View-only planning access.') }
  ];"""

content = content.replace(old_roles, new_roles)

# 5. JSX strings and nodes replacements
jsx_replacements = [
    # Join flow invitations
    ('<h3 style={{ margin: 0, fontSize: \'1.2rem\', color: \'var(--text)\' }}>Loading Dynasty Invitation...</h3>', '<h3 style={{ margin: 0, fontSize: \'1.2rem\', color: \'var(--text)\' }}>{t(\'loading_dynasty_invitation\', \'Loading Dynasty Invitation...\')}</h3>'),
    ('<h3 style={{ margin: \'0 0 10px\', fontSize: \'1.25rem\', color: \'var(--text)\' }}>Invalid Invitation</h3>', '<h3 style={{ margin: \'0 0 10px\', fontSize: \'1.25rem\', color: \'var(--text)\' }}>{t(\'invalid_invitation\', \'Invalid Invitation\')}</h3>'),
    ('<button onClick={() => setPage(\'dashboard\')} className="onb-btn-back" style={{ width: \'100%\', padding: \'12px\' }}>\\n              Back to Dashboard\\n            </button>', '<button onClick={() => setPage(\'dashboard\')} className="onb-btn-back" style={{ width: \'100%\', padding: \'12px\' }}>\\n              {t(\'back_to_dashboard\', \'Back to Dashboard\')}\\n            </button>'),
    ('Joined Dynasty', '{t(\'joined_dynasty\', \'Joined Dynasty\')}'),
    ('You have successfully linked your profile with the <strong>{fetchedWorkspace?.name}</strong> Dynasty.', '{t(\'joined_dynasty_desc_before\', \'You have successfully linked your profile with the\')} <strong>{fetchedWorkspace?.name}</strong> {t(\'joined_dynasty_desc_after\', \'Dynasty.\')}'),
    ('Open Dynasty Command', '{t(\'open_dynasty_command\', \'Open Dynasty Command\')}'),
    ('Join Family Dynasty', '{t(\'join_family_dynasty\', \'Join Family Dynasty\')}'),
    ('You are invited to join a secure multi-generational workspace.', '{t(\'invited_join_dynasty_desc\', \'You are invited to join a secure multi-generational workspace.\')}'),
    ('Dynasty Parameters', '{t(\'dynasty_parameters\', \'Dynasty Parameters\')}'),
    ('<span style={{ color: \'var(--text-muted)\' }}>Founder Name:</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'founder_name_label\', \'Founder Name:\')}</span>'),
    ('<span style={{ color: \'var(--text-muted)\' }}>Founder Email:</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'founder_email_label\', \'Founder Email:\')}</span>'),
    ('<span style={{ color: \'var(--text-muted)\' }}>Current Members:</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'current_members_label\', \'Current Members:\')}</span>'),
    ('Select Your Role in the Dynasty', '{t(\'select_role_in_dynasty\', \'Select Your Role in the Dynasty\')}'),
    ('I agree to synchronize my allocations and asset ledger with this Dynasty workspace.', '{t(\'join_consent_label\', \'I agree to synchronize my allocations and asset ledger with this Dynasty workspace.\')}'),
    ('{isJoining ? \'Joining...\' : \'Join Workspace\'}', '{isJoining ? t(\'joining_status\', \'Joining...\') : t(\'join_workspace_btn\', \'Join Workspace\')}'),
    
    # Onboarding success
    ('Dynasty Established', '{t(\'dynasty_established\', \'Dynasty Established\')}'),
    ('Your secure Family Dynasty workspace is now live. Invite trusted members and start tracking multi-generational wealth.', '{t(\'dynasty_established_desc\', \'Your secure Family Dynasty workspace is now live. Invite trusted members and start tracking multi-generational wealth.\')}'),
    ('Open Workspace', '{t(\'open_workspace\', \'Open Workspace\')}'),
    
    # Onboarding step tracker
    ('Dynasty Setup (Step {onbStep} of 6)', '{t(\'dynasty_setup_step\', \'Dynasty Setup (Step {step} of 6)\').replace(\'{step}\', onbStep)}'),
    
    # Step 1
    ('Family Dynasty', '{t(\'family_dynasty\', \'Family Dynasty\')}'),
    ('Coordinate multi-generational planning, distribute inheritance allocations, and lock secure trusts.', '{t(\'family_dynasty_intro_desc\', \'Coordinate multi-generational planning, distribute inheritance allocations, and lock secure trusts.\')}'),
    ('Create Dynasty', '{t(\'create_dynasty_btn\', \'Create Dynasty\')}'),
    ('{title: "Shared Family Pool", desc: "Consolidate calculations and projection models across members."}', '{title: t(\'shared_family_pool\', \'Shared Family Pool\'), desc: t(\'shared_family_pool_desc\', \'Consolidate calculations and projection models across members.\')}'),
    ('{title: "Inheritance Allocations", desc: "Designate trust releases triggered by milestones or ages."}', '{title: t(\'inheritance_allocations\', \'Inheritance Allocations\'), desc: t(\'inheritance_allocations_desc\', \'Designate trust releases triggered by milestones or ages.\')}'),
    ('{title: "Sovereign Trust Vault", desc: "Dual-signature safety parameter rules for sensitive documentation."}', '{title: t(\'sovereign_trust_vault\', \'Sovereign Trust Vault\'), desc: t(\'sovereign_trust_vault_desc\', \'Dual-signature safety parameter rules for sensitive documentation.\')}'),
    ('{title: "Trusted Role Boundaries", desc: "Founder, Spouse, Parent, Child, and Advisor permissions."}', '{title: t(\'trusted_role_boundaries\', \'Trusted Role Boundaries\'), desc: t(\'trusted_role_boundaries_desc\', \'Founder, Spouse, Parent, Child, and Advisor permissions.\')}'),
    
    # Step 2
    ('Name Your Dynasty', '{t(\'name_your_dynasty\', \'Name Your Dynasty\')}'),
    ('Establish the identity of your family planning pool.', '{t(\'establish_identity_pool\', \'Establish the identity of your family planning pool.\')}'),
    ('Dynasty Name', '{t(\'dynasty_name_label\', \'Dynasty Name\')}'),
    ('placeholder="e.g. Skywalker, Rothschild"', 'placeholder={t(\'dynasty_name_placeholder\', \'e.g. Skywalker, Rothschild\')}'),
    ('Dynasty Description (Optional)', '{t(\'dynasty_description_label\', \'Dynasty Description (Optional)\')}'),
    ('placeholder="e.g. Securing assets across generations and establishing family governance."', 'placeholder={t(\'dynasty_description_placeholder\', \'e.g. Securing assets across generations and establishing family governance.\')}'),
    
    # Step 3
    ('Your Family Code', '{t(\'your_family_code\', \'Your Family Code\')}'),
    ('This unique key allows family members to search and connect.', '{t(\'family_code_desc\', \'This unique key allows family members to search and connect.\')}'),
    ('Copy Family Code', '{t(\'copy_family_code_btn\', \'Copy Family Code\')}'),
    ('Continue to Invites', '{t(\'continue_to_invites_btn\', \'Continue to Invites\')}'),
    
    # Step 4
    ('Invite Members', '{t(\'invite_members_title\', \'Invite Members\')}'),
    ('Select an invitation route below to add trusted members to your dynasty.', '{t(\'invite_members_desc\', \'Select an invitation route below to add trusted members to your dynasty.\')}'),
    ('Scan to connect node', '{t(\'scan_connect_node\', \'Scan to connect node\')}'),
    ('Shareable Invite Link', '{t(\'shareable_invite_link\', \'Shareable Invite Link\')}'),
    ('Copy', '{t(\'copy_btn\', \'Copy\')}'),
    ('Share', '{t(\'share_btn\', \'Share\')}'),
    ('Continue to Roles', '{t(\'continue_to_roles_btn\', \'Continue to Roles\')}'),
    
    # Step 5
    ('Your Dynasty Role', '{t(\'your_dynasty_role\', \'Your Dynasty Role\')}'),
    ('Assign your role parameters in the family workspace.', '{t(\'assign_role_desc\', \'Assign your role parameters in the family workspace.\')}'),
    ('Continue to Activation', '{t(\'continue_to_activation_btn\', \'Continue to Activation\')}'),
    
    # Step 6
    ('Activate Dynasty Workspace', '{t(\'activate_dynasty_workspace\', \'Activate Dynasty Workspace\')}'),
    ('Confirm Parameters to instantiate the multi-generation ledger on Firestore.', '{t(\'confirm_parameters_desc\', \'Confirm Parameters to instantiate the multi-generation ledger on Firestore.\')}'),
    ('Confirmation Ledger', '{t(\'confirmation_ledger\', \'Confirmation Ledger\')}'),
    ('<span style={{ color: \'var(--text-muted)\' }}>Dynasty Name:</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'dynasty_name_confirm\', \'Dynasty Name:\')}</span>'),
    ('<span style={{ color: \'var(--text-muted)\' }}>Your Assigned Role:</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'assigned_role_confirm\', \'Your Assigned Role:\')}</span>'),
    ('{selectedRole}', '{t(selectedRole.toLowerCase(), selectedRole)}'),
    ('<span style={{ color: \'var(--text-muted)\' }}>Family Code:</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'family_code_confirm\', \'Family Code:\')}</span>'),
    ('I agree to instantiate this Family Dynasty and link my financial planning node to this workspace.', '{t(\'activate_consent_label\', \'I agree to instantiate this Family Dynasty and link my financial planning node to this workspace.\')}'),
    ('{isActivating ? \'Activating Ledger...\' : \'Activate Dynasty\'}', '{isActivating ? t(\'activating_ledger\', \'Activating Ledger...\') : t(\'activate_dynasty_btn\', \'Activate Dynasty\')}'),
    
    # Shared buttons inside wizards
    ('Continue', '{t(\'continue_btn\', \'Continue\')}'),
    ('Back', '{t(\'back_btn\', \'Back\')}'),
    ('Cancel', '{t(\'cancel\', \'Cancel\')}'),
    
    # Main active Dashboard header
    ('<span className="stage-badge married" style={{ background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`, color: \'#fff\' }}>Family Dynasty</span>', '<span className="stage-badge married" style={{ background: `linear-gradient(135deg, ${T.gold} 0%, #d4a017 100%)`, color: \'#fff\' }}>{t(\'family\', \'Family Dynasty\')}</span>'),
    ('<span style={{ color: \'var(--text-muted)\' }}>· Multi-Generational Asset Command</span>', '<span style={{ color: \'var(--text-muted)\' }}>{t(\'multigen_asset_command\', \'· Multi-Generational Asset Command\')}</span>'),
    ('{dynastyWorkspaceName ? `${dynastyWorkspaceName} Dynasty` : \'Dynasty\'} <em>Command</em>', '{dynastyWorkspaceName ? `${dynastyWorkspaceName} ${t(\'dynasty_label\', \'Dynasty\')}` : t(\'dynasty_label\', \'Dynasty\')} <em>{t(\'command_title\', \'Command\')}</em>'),
    ('Oversee trust fund allocations, successors inheritance metrics, secure vaults, and dynamic rule governance.', '{t(\'dynasty_page_desc\', \'Oversee trust fund allocations, successors inheritance metrics, secure vaults, and dynamic rule governance.\')}'),
    ('Simulate Active Partner:', '{t(\'simulate_active_partner\', \'Simulate Active Partner:\')}'),
    
    # Lock banner
    ('Collaborative Dynasty Dashboard Restricted', '{t(\'dynasty_restricted_title\', \'Collaborative Dynasty Dashboard Restricted\')}'),
    ('Invite a co-trustee or partner to lock in multi-generational governance rules and verify asset ledger changes.', '{t(\'dynasty_restricted_desc\', \'Invite a co-trustee or partner to lock in multi-generational governance rules and verify asset ledger changes.\')}'),
    ('<UserPlus size={14} style={{ marginRight: \'6px\' }} /> Invite Co-Trustee', '<UserPlus size={14} style={{ marginRight: \'6px\' }} /> {t(\'invite_co_trustee_btn\', \'Invite Co-Trustee\')}'),
    ('Bypass Demo Lock', '{t(\'bypass_demo_lock_btn\', \'Bypass Demo Lock\')}'),
    
    # Compounder card
    ('Dynastic Compounder', '{t(\'dynastic_compounder_title\', \'Dynastic Compounder\')}'),
    ('Projected Estate', '{t(\'projected_estate_label\', \'Projected Estate\')}'),
    ('Generational Wealth Vault Projections', '{t(\'generational_vault_projections\', \'Generational Wealth Vault Projections\')}'),
    ('Compounding assets dedicated for family legacy inheritance.', '{t(\'generational_vault_projections_desc\', \'Compounding assets dedicated for family legacy inheritance.\')}'),
    ('Initial Trust Fund Corpus', '{t(\'initial_trust_corpus\', \'Initial Trust Fund Corpus\')}'),
    ('Monthly Contribution to Legacy Fund', '{t(\'monthly_contribution_legacy\', \'Monthly Contribution to Legacy Fund\')}'),
    ('Target Horizon', '{t(\'target_horizon\', \'Target Horizon\')}'),
    ('{compoundingYears} Yrs', '{compoundingYears} {t(\'years_unit\', \'Yrs\')}'),
    ('Estimated Annual Yield', '{t(\'estimated_annual_yield\', \'Estimated Annual Yield\')}'),
    ('Projected Dynastic Wealth Corpus', '{t(\'projected_dynastic_corpus\', \'Projected Dynastic Wealth Corpus\')}'),
    ('Monthly investment compounding at {expectedYield}% annually over {compoundingYears} years.', '{t(\'projected_corpus_desc\', \'Monthly investment compounding at {yield}% annually over {years} years.\').replace(\'{yield}\', expectedYield).replace(\'{years}\', compoundingYears)}'),
    ('🔒 Dynastic Trust Calculator', '{t(\'dynasty_trust_calc_lock\', \'🔒 Dynastic Trust Calculator\')}'),
    ('Please simulate active partner link or verify status to enable trust compounding metrics.', '{t(\'dynasty_lock_desc\', \'Please simulate active partner link or verify status to enable trust compounding metrics.\')}'),
    ('🔒 Family Heir Node Map', '{t(\'family_heir_node_map_lock\', \'🔒 Family Heir Node Map\')}'),
    
    # Heir mapping tree
    ('Visual Heir Mapping', '{t(\'visual_heir_mapping\', \'Visual Heir Mapping\')}'),
    ('Total: {totalAllocation}%', '{t(\'total_allocation_percent\', \'Total: {percent}%\').replace(\'{percent}\', totalAllocation)}'),
    ('Interactive Dynasty Tree', '{t(\'interactive_dynasty_tree\', \'Interactive Dynasty Tree\')}'),
    ('Click nodes to define successor parameters or adjust split.', '{t(\'interactive_dynasty_tree_desc\', \'Click nodes to define successor parameters or adjust split.\')}'),
    ('Co-Trustee Root Node', '{t(\'co_trustee_root_node\', \'Co-Trustee Root Node\')}'),
    ('{partner1?.name || \'You\'} &amp; {isSimulatedLinked ? (partner2?.name || \'Sophia\') : \'Sophia (Pending)\'}', '{partner1?.name || t(\'you_label\', \'You\')} &amp; {isSimulatedLinked ? (partner2?.name || \'Sophia\') : t(\'sophia_pending_label\', \'Sophia (Pending)\')}'),
    ('{child.name}', '{child.name === \'Grandchildren Trust\' ? t(\'grandchildren_trust\', \'Grandchildren Trust\') : child.name}'),
    ('{child.allocation}% Split', '{t(\'percent_split\', \'{percent}% Split\').replace(\'{percent}\', child.allocation)}'),
    ('placeholder="Name..."', 'placeholder={t(\'heir_name_placeholder\', \'Name...\')}'),
    ('placeholder="Age"', 'placeholder={t(\'heir_age_placeholder\', \'Age\')}'),
    ('placeholder="%"', 'placeholder={t(\'heir_percent_placeholder\', \'%\')}'),
    
    # Successor parameters detail panel
    ('Successor Legacy Parameters', '{t(\'successor_legacy_params\', \'Successor Legacy Parameters\')}'),
    ('Allocation for: {selectedChild.name}', '{t(\'allocation_for_name\', \'Allocation for: {name}\').replace(\'{name}\', selectedChild.name === \'Grandchildren Trust\' ? t(\'grandchildren_trust\', \'Grandchildren Trust\') : selectedChild.name)}'),
    ('Manage locking thresholds and trust fund payouts.', '{t(\'manage_locking_thresholds\', \'Manage locking thresholds and trust fund payouts.\')}'),
    ('Estate Split Allocation', '{t(\'estate_split_allocation\', \'Estate Split Allocation\')}'),
    ('Normalized (Total 100%)', '{t(\'normalized_total_100\', \'Normalized (Total 100%)\')}'),
    ('Vesting Age Lock Trigger', '{t(\'vesting_age_lock_trigger\', \'Vesting Age Lock Trigger\')}'),
    ('Release funds to heir upon reaching target age.', '{t(\'release_funds_desc\', \'Release funds to heir upon reaching target age.\')}'),
    ('Years Old', '{t(\'years_old_unit\', \'Years Old\')}'),
    ('Milestone Payout Qualifier', '{t(\'milestone_payout_qualifier\', \'Milestone Payout Qualifier\')}'),
    ('Additional trigger conditions for early partial releases.', '{t(\'milestone_conditions_desc\', \'Additional trigger conditions for early partial releases.\')}'),
    ('<option value="Graduation">Graduation Day</option>', '<option value="Graduation">{t(\'graduation_day_option\', \'Graduation Day\')}</option>'),
    ('<option value="Marriage">Marriage Deed</option>', '<option value="Marriage">{t(\'marriage_deed_option\', \'Marriage Deed\')}</option>'),
    ('<option value="First Home">First Home purchase</option>', '<option value="First Home">{t(\'first_home_option\', \'First Home purchase\')}</option>'),
    ('<option value="Age Threshold">Age Threshold Only</option>', '<option value="Age Threshold">{t(\'age_threshold_option\', \'Age Threshold Only\')}</option>'),
    ('Legacy Distribution sum is currently {totalAllocation}%. We recommend balancing to 100%.', '{t(\'legacy_distribution_warning\', \'Legacy Distribution sum is currently {percent}%. We recommend balancing to 100%.\').replace(\'{percent}\', totalAllocation)}'),
    ('onClick={() => alert(`Locked estate instructions for ${selectedChild.name} updated. Triggers registered.`)}', 'onClick={() => alert(t(\'locked_instructions_alert\', \'Locked estate instructions for {name} updated. Triggers registered.\').replace(\'{name}\', selectedChild.name === \'Grandchildren Trust\' ? t(\'grandchildren_trust\', \'Grandchildren Trust\') : selectedChild.name))}'),
    ('Lock Instructions', '{t(\'lock_instructions_btn\', \'Lock Instructions\')}'),
    
    # Trust Governance & Estate Vault
    ('Trust Governance &amp; Estate Vault', '{t(\'trust_governance_vault\', \'Trust Governance & Estate Vault\')}'),
    ('Dynamic Estate Ledger Rules', '{t(\'dynamic_estate_rules\', \'Dynamic Estate Ledger Rules\')}'),
    ('Secure storage of verified documents with dual trustee approvals.', '{t(\'secure_storage_documents_desc\', \'Secure storage of verified documents with dual trustee approvals.\')}'),
    ('Require Dual-Parent Signatures', '{t(\'require_dual_parent_signatures\', \'Require Dual-Parent Signatures\')}'),
    ('Encrypted Documents ({documents.length})', '{t(\'encrypted_documents_count\', \'Encrypted Documents ({count})\').replace(\'{count}\', documents.length)}'),
    ('{doc.name}', '{doc.name === \'Last Will & Testament.pdf\' ? t(\'doc_will_pdf\', \'Last Will & Testament.pdf\') : doc.name === \'Family Living Trust Agreement.pdf\' ? t(\'doc_trust_pdf\', \'Family Living Trust Agreement.pdf\') : doc.name === \'Asset Distribution Ledger.xlsx\' ? t(\'doc_ledger_xlsx\', \'Asset Distribution Ledger.xlsx\') : doc.name === \'Multi-Gen Power of Attorney.pdf\' ? t(\'doc_poa_pdf\', \'Multi-Gen Power of Attorney.pdf\') : doc.name}'),
    ('{doc.size} · Saved {doc.date}', '{t(\'doc_size_saved_date\', \'{size} · Saved {date}\').replace(\'{size}\', doc.size).replace(\'{date}\', doc.date)}'),
    ('{doc.signed ? \'Signed\' : \'Unlock\'}', '{doc.signed ? t(\'signed_status\', \'Signed\') : t(\'unlock_status\', \'Unlock\')}'),
    ('onClick={() => alert(\'Secure document upload initialized. Files will be locally encrypted.\')}', 'onClick={() => alert(t(\'secure_upload_alert\', \'Secure document upload initialized. Files will be locally encrypted.\'))}'),
    ('+ Upload New Trust Agreement', '{t(\'upload_new_trust_btn\', \'+ Upload New Trust Agreement\')}'),
    
    # Multi-generation linking pairing
    ('Multi-Generation Dynasty Linking', '{t(\'multigen_dynasty_linking\', \'Multi-Generation Dynasty Linking\')}'),
    ('Provide immediate legacy access to direct beneficiaries, co-trustees, or generational financial advisors by generating secure pairing invites.', '{t(\'multigen_linking_desc\', \'Provide immediate legacy access to direct beneficiaries, co-trustees, or generational financial advisors by generating secure pairing invites.\')}'),
    ('Launch Invite Interface', '{t(\'launch_invite_interface_btn\', \'Launch Invite Interface\')}'),
    ('Pair Legacy Node', '{t(\'pair_legacy_node\', \'Pair Legacy Node\')}'),
    ('Scan to authorize read-only ledger pairing or co-trustee signature credentials.', '{t(\'scan_pairing_desc\', \'Scan to authorize read-only ledger pairing or co-trustee signature credentials.\')}'),
    ('Heir / Successor', '{t(\'heir_successor_btn\', \'Heir / Successor\')}'),
    ('Co-Trustee', '{t(\'co_trustee_btn\', \'Co-Trustee\')}'),
    ('Invite Pairing Code', '{t(\'invite_pairing_code\', \'Invite Pairing Code\')}'),
    ('onClick={() => {\n                alert(`Invite pairing code copied to clipboard: ${invitationCode}`);\n                setShowQRModal(false);\n              }}', 'onClick={() => {\n                alert(t(\'pairing_code_copied_alert\', \'Invite pairing code copied to clipboard: {code}\').replace(\'{code}\', invitationCode));\n                setShowQRModal(false);\n              }}'),
    ('Copy Link &amp; Close', '{t(\'copy_link_close_btn\', \'Copy Link & Close\')}'),
]

for old, new in jsx_replacements:
    # Double check if old matches and replace
    if old in content:
        content = content.replace(old, new)
    else:
        # Try without newlines or simple variations if necessary
        # But literal strings match in most cases
        pass

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
