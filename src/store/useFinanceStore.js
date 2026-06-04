import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generatePersonalId, generateCoupleId, generateFamilyId, generateEverBondId } from '../utils/everbondId';
import { generateInsightsData } from '../utils/insightsData';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      // Onboarding & Stage System
      started:   false,
      onboardingComplete: false,
      stage:     'Single', // 'Single' | 'Committed' | 'Married'
      relationshipStage: 'Single',
      partner1:  '',
      userName:  '',
      partner2:  '',
      partnerName: '',
      region:    'India',
      country:   'India',
      currency:  'INR',
      dreamGoals: [],
      mindset:   'Balanced',
      theme:     'light',

      // Visual Wealth Insights Center State
      historicalNetWorth: [],
      incomeHistory: [],
      expenseHistory: [],
      goalProgress: [],
      wealthForecast: [],
      savingsRate: null,
      partnerWealthData: null,

      // Notifications System
      notifications: [
        {
          id: 'welcome-init',
          type: 'system',
          title: 'Welcome to EverBond Wealth',
          description: 'Your premium shared financial journey starts here. Explore milestones, set goals, and connect your nodes.',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'partner-request-sent',
          type: 'partner',
          title: 'Partner Connection Request Sent',
          description: 'An invitation code has been generated. Share it with your partner to link dashboards.',
          isRead: false,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
          id: 'income-added-init',
          type: 'financial',
          title: 'Income Added Successfully',
          description: 'Primary income node recorded. Your allocation splits are computed automatically.',
          isRead: true,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'goal-created-init',
          type: 'financial',
          title: 'Financial Goal Created',
          description: 'A new Retirement target has been initialized under your wealth blueprint.',
          isRead: true,
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: 'relationship-journey-updated',
          type: 'relationship',
          title: 'Relationship Journey Updated',
          description: 'Unlock Couple and Family Dynasty dashboards by progressing through life stages.',
          isRead: true,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        }
      ],

      // Journey Timeline System
      timelineEvents: [
        {
          eventId: 'ev-welcome',
          type: 'system',
          title: 'Welcome to EverBond Wealth',
          description: 'Your premium wealth planning workspace has been initialized.',
          createdBy: 'System',
          isMilestone: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          eventId: 'ev-profile',
          type: 'profile',
          title: 'Profile Created',
          description: 'Identity parameters established for your EverBond node.',
          createdBy: 'System',
          isMilestone: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          eventId: 'ev-income',
          type: 'financial',
          title: 'Income Added',
          description: 'Primary income node recorded. Allocation engine active.',
          createdBy: 'Solo Builder',
          isMilestone: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          eventId: 'ev-goal',
          type: 'goal',
          title: 'Goal Created',
          description: 'Retirement Corpus goal added to wealth blueprint.',
          createdBy: 'Solo Builder',
          isMilestone: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          eventId: 'ev-partner-req',
          type: 'relationship',
          title: 'Partner Connection Request Sent',
          description: 'Cryptographic invite generated. Waiting for partner ledger handshake.',
          createdBy: 'Solo Builder',
          isMilestone: false,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ],

      // ── EverBond ID Partner Linking System ──
      everBondId:          '',              // User's permanent EB-[NAME_4]-[HEX_4] (generated on profile save)
      coupleId:            '',              // Permanent Couple ID (EB-COUPLE-XXXX-XXXX)
      familyId:            '',              // Permanent Family ID (EB-FAMILY-XXXX-XXXXX)
      partnerEverBondId:   '',              // Partner's EverBond ID
      connectionStatus:    'none',          // 'none' | 'pending' | 'received' | 'connected'
      requestSentAt:       null,            // ISO timestamp when request was sent
      relationshipDate:    '',              // Anniversary / relationship date
      relationshipId:      '',              // Unique relationship identifier
      
      // Future backend preparation fields
      requestSent:         false,           // User sent a connection request
      requestReceived:     false,           // User received a connection request
      connectedAt:         null,            // ISO timestamp when accepted
      incomingRequest:     null,            // Incoming request metadata { senderEverBondId, senderName, relationshipDate, sentAt }

      // Legacy verification states (kept for backward compat during transition)
      invitationAccepted: false,
      selfieUploaded:     false,
      selfieUrl:          '',
      accountsConnected:  false,
      relationshipVerified: false,

      // Mapped from legacy → new system
      partnerLinked:      false,
      partnerAccepted:    false,
      verificationStatus: 'unverified', // 'unverified' | 'awaiting' | 'connected' | 'verified'
      invitationCode:     '',
      partnerId:          '',

      // Onboarding data splits
      onboardingSingle: {
        name: '',
        age: '',
        country: 'India',
        income: '',
        careerStage: '',
        financialGoals: '',
      },
      onboardingCommitted: {
        name: '',
        partnerName: '',
        anniversaryDate: '',
        combinedGoals: '',
      },
      onboardingMarried: {
        name: '',
        partnerName: '',
        familyGoals: '',
        childPlans: '',
        currentSavings: '',
        futurePlanningGoals: '',
      },

      // Income
      p1Salary: 100000,
      p2Salary: 0,

      // Settings
      mode:      'Balanced',
      simYears:  10,
      simReturn: null,

      // Goals
      goalTargets: {
        child:      5000000,
        retirement: 20000000,
        house:      8000000,
        vacation:   500000,
      },

      // Milestones
      milestones: [],

      // ── Actions ──

      syncInsightsData: () => {
        const data = generateInsightsData(get());
        set(data);
      },

      setStage: stage => {
        const currentFamilyId = get().familyId;
        const patch = { stage, relationshipStage: stage };
        if (stage === 'Married' && !currentFamilyId) {
          patch.familyId = generateFamilyId(get().partner1, get().partner2);
        }

        const stageNames = {
          Single: 'Single Builder',
          Committed: 'Committed Couple',
          Married: 'Married Dynasty'
        };
        
        get().addNotification({
          type: 'relationship',
          title: stage === 'Married' ? 'Family Dashboard Activated' : 'Shared Journey Activated',
          description: `Stage upgraded to ${stageNames[stage] || stage}. New planning tools are now unlocked.`
        });

        get().addTimelineEvent({
          type: 'profile',
          title: 'Relationship Stage Updated',
          description: `Stage set to ${stageNames[stage] || stage}. Dashboard systems calibrated.`,
          isMilestone: stage === 'Married' || stage === 'Committed'
        });

        set(patch);
        get().syncInsightsData();
      },
      setMindset: mindset => { set({ mindset, mode: mindset }); get().syncInsightsData(); },
      setDreamGoals: dreamGoals => { set({ dreamGoals }); get().syncInsightsData(); },
      setTheme: theme => {
        get().addNotification({
          type: 'system',
          title: 'Theme Updated',
          description: `Visual appearance changed to ${theme === 'light' ? 'Light Theme' : 'Dark Theme'}.`
        });
        
        get().addTimelineEvent({
          type: 'system',
          title: 'Theme Changed',
          description: `User interface set to ${theme === 'light' ? 'Light Mode' : 'Dark Mode'}.`,
          createdBy: 'System'
        });

        set({ theme });
      },
      
      setOnboardingSingle: data => set(s => ({ onboardingSingle: { ...s.onboardingSingle, ...data } })),
      setOnboardingCommitted: data => set(s => ({ onboardingCommitted: { ...s.onboardingCommitted, ...data } })),
      setOnboardingMarried: data => set(s => ({ onboardingMarried: { ...s.onboardingMarried, ...data } })),

      setVerificationState: patch => set(patch),

      // ── EverBond ID Actions ──

      /** Generate and persist an EverBond ID if one doesn't exist */
      initEverBondId: () => {
        const current = get().everBondId;
        // If empty or in old 6-character format, generate a new personalized / default Personal ID
        if (!current || current.length <= 9) {
          set({ everBondId: generatePersonalId(get().partner1 || 'USER') });
        }
      },

      /** Send a connection request to a partner */
      sendConnectionRequest: ({ partnerEverBondId, relationshipDate }) => {
        get().addNotification({
          type: 'partner',
          title: 'Partner Connection Request Sent',
          description: `Invitation sent to ID: ${partnerEverBondId}. Share it to link dashboards.`
        });
        
        get().addTimelineEvent({
          type: 'relationship',
          title: 'Partner Connection Request Sent',
          description: `Cryptographic linkage code generated for partner ID: ${partnerEverBondId}.`
        });

        set({
          partnerEverBondId,
          relationshipDate: relationshipDate || '',
          connectionStatus: 'pending',
          requestSentAt: new Date().toISOString(),
          requestSent: true,
          requestReceived: false,
          // Also sync legacy fields for backward compat
          verificationStatus: 'awaiting',
        });
      },

      /** Simulate an incoming request from another user (for testing received state) */
      simulateIncomingRequest: ({ senderEverBondId, senderName, relationshipDate }) => {
        const dateVal = relationshipDate || '2025-02-15';
        get().addNotification({
          type: 'partner',
          title: 'Partner Connection Request Received',
          description: `${senderName} wants to link financial nodes with you. Review and accept the invitation.`
        });
        
        get().addTimelineEvent({
          type: 'relationship',
          title: 'Partner Connection Request Received',
          description: `${senderName} requested to connect dashboards. Handshake pending.`
        });

        set({
          connectionStatus: 'received',
          requestSent: false,
          requestReceived: true,
          incomingRequest: {
            senderEverBondId,
            senderName,
            relationshipDate: dateVal,
            sentAt: new Date().toISOString(),
          },
          // Populate fields so acceptance resolves smoothly
          partnerEverBondId: senderEverBondId,
          partner2: senderName,
          partnerName: senderName,
          relationshipDate: dateVal,
          verificationStatus: 'awaiting',
        });
      },

      /** Decline an incoming request */
      declineRequest: () => {
        get().addNotification({
          type: 'partner',
          title: 'Connection Request Declined',
          description: `The incoming partner invitation has been declined.`
        });
        
        get().addTimelineEvent({
          type: 'relationship',
          title: 'Connection Request Declined',
          description: `Handshake request was declined by the user.`
        });

        set({
          connectionStatus: 'none',
          requestSent: false,
          requestReceived: false,
          incomingRequest: null,
          partnerEverBondId: '',
          partner2: '',
          partnerName: '',
          relationshipDate: '',
          requestSentAt: null,
          connectedAt: null,
          verificationStatus: 'unverified',
        });
      },

      /** Accept/complete the connection (either pending or received) */
      acceptConnection: ({ partnerName }) => {
        const relId = `REL-${Math.floor(100000 + Math.random() * 900000)}`;
        const incoming = get().incomingRequest;
        
        const resolvedName = partnerName || (incoming ? incoming.senderName : '') || get().partnerName || 'Partner';
        const resolvedId = get().partnerEverBondId || (incoming ? incoming.senderEverBondId : '') || 'EB-UNKNOWN';
        const resolvedDate = get().relationshipDate || (incoming ? incoming.relationshipDate : '');
        
        // Generate Couple ID once connection is established
        let resolvedCoupleId = get().coupleId;
        if (!resolvedCoupleId) {
          resolvedCoupleId = generateCoupleId();
        }

        get().addNotification({
          type: 'partner',
          title: 'Partner Connected Successfully',
          description: `Connected to ${resolvedName}. Your shared financial nodes are now active.`
        });

        get().addNotification({
          type: 'relationship',
          title: 'Couple Dashboard Unlocked',
          description: 'Shared allocations, milestone planning, and combined income streams are now active.'
        });

        get().addTimelineEvent({
          type: 'relationship',
          title: 'Partner Accepted Connection',
          description: `Consensual handshake completed with ${resolvedName}. Dual ledgers synced.`
        });
        
        get().addTimelineEvent({
          type: 'relationship',
          title: 'Shared Journey Activated',
          description: `Secure couple planning channel established between ${get().partner1 || 'User'} and ${resolvedName}.`,
          isMilestone: true
        });
        
        get().addTimelineEvent({
          type: 'relationship',
          title: 'Couple Dashboard Unlocked',
          description: `Consolidated allocations, joint target setting, and savings splits are now active.`,
          isMilestone: true
        });

        set({
          connectionStatus: 'connected',
          partner2: resolvedName,
          partnerName: resolvedName,
          partnerEverBondId: resolvedId,
          relationshipDate: resolvedDate,
          relationshipId: relId,
          coupleId: resolvedCoupleId,
          connectedAt: new Date().toISOString(),
          requestSent: false,
          requestReceived: false,
          incomingRequest: null,
          
          // Sync legacy fields
          partnerLinked: true,
          partnerAccepted: true,
          verificationStatus: 'verified',
          partnerId: resolvedId,
        });
        get().syncInsightsData();
      },

      /** Disconnect partner — reset all connection state */
      disconnectPartner: () => {
        get().addNotification({
          type: 'partner',
          title: 'Partner Disconnected',
          description: 'Your financial dashboard has been unlinked from your partner node.'
        });
        
        get().addTimelineEvent({
          type: 'profile',
          title: 'Partner Disconnected',
          description: `Cryptographic unlinking complete. Shared folders unmounted.`,
          isMilestone: true
        });

        set({
          connectionStatus: 'none',
          partnerEverBondId: '',
          relationshipDate: '',
          requestSentAt: null,
          relationshipId: '',
          coupleId: '',
          familyId: '',
          partner2: '',
          partnerName: '',
          requestSent: false,
          requestReceived: false,
          connectedAt: null,
          incomingRequest: null,
          // Sync legacy fields
          partnerLinked: false,
          partnerAccepted: false,
          verificationStatus: 'unverified',
          invitationCode: '',
          partnerId: '',
        });
        get().syncInsightsData();
      },

      addNotification: ({ type, title, description }) => {
        const newNotif = {
          id: `nt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type,
          title,
          description,
          isRead: false,
          createdAt: new Date().toISOString()
        };
        set(s => ({
          notifications: [newNotif, ...s.notifications].slice(0, 50)
        }));
      },
      markAsRead: (id) => set(s => ({
        notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      markAllRead: () => set(s => ({
        notifications: s.notifications.map(n => ({ ...n, isRead: true }))
      })),
      clearAll: () => set({ notifications: [] }),
      deleteNotification: (id) => set(s => ({
        notifications: s.notifications.filter(n => n.id !== id)
      })),

      addTimelineEvent: ({ type, title, description, createdBy, isMilestone }) => {
        const user = createdBy || get().partner1 || 'User';
        const relId = get().relationshipId || get().coupleId || 'single-node';
        const newEvent = {
          eventId: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type,
          title,
          description,
          createdBy: user,
          relationshipId: relId,
          isMilestone: !!isMilestone,
          createdAt: new Date().toISOString()
        };
        set(s => ({
          timelineEvents: [newEvent, ...s.timelineEvents].slice(0, 80)
        }));
      },

      simulatePartnerActivity: (activityType) => {
        if (get().connectionStatus !== 'connected') return;
        const p2 = get().partner2 || 'Partner';
        let patch = {};
        
        switch (activityType) {
          case 'profile_updated':
            patch = {
              type: 'profile',
              title: 'Partner Updated Profile',
              description: `${p2} updated their profile settings and career indices.`
            };
            break;
          case 'goal_added':
            patch = {
              type: 'goal',
              title: 'Partner Added Goal',
              description: `${p2} added a new shared goal: "Dream Vacation / Travel".`
            };
            break;
          case 'allocation_updated':
            patch = {
              type: 'financial',
              title: 'Partner Updated Allocation',
              description: `${p2} modified allocation compromises towards a more aggressive mindset.`
            };
            break;
          case 'milestone_completed':
            patch = {
              type: 'financial',
              title: 'Partner Completed Milestone',
              description: `${p2} marked the "Tech / Gadget upgrades" milestone as Achieved!`,
              isMilestone: true
            };
            break;
          default:
            return;
        }
        
        get().addTimelineEvent({
          ...patch,
          createdBy: p2
        });
      },

      setProfile: (profileData) => {
        const { 
          partner1, 
          partner2, 
          region, 
          currency, 
          stage, 
          p1Salary, 
          p2Salary,
          partnerLinked,
          partnerAccepted,
          verificationStatus,
          invitationCode,
          partnerId,
          relationshipId,
          everBondId,
          partnerEverBondId,
          connectionStatus,
          relationshipDate,
        } = profileData;

        const wasCompleted = get().onboardingComplete;

        const update = { 
          started: true, 
          onboardingComplete: true, 
          partner1, 
          userName: partner1,
          partner2, 
          partnerName: partner2,
          region, 
          country: region,
          currency 
        };
        if (stage) {
          update.stage = stage;
          update.relationshipStage = stage;
          // Generate Family ID if stage is Married
          if (stage === 'Married' && !get().familyId) {
            update.familyId = generateFamilyId(partner1 || get().partner1, partner2 || get().partner2);
          }
        }
        if (p1Salary !== undefined) update.p1Salary = p1Salary;
        if (p2Salary !== undefined) update.p2Salary = p2Salary;
        
        // Check and personalize Personal ID based on user name
        const existingId = everBondId || get().everBondId;
        if (!existingId || existingId.length <= 9 || (partner1 && !existingId.includes(partner1.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)))) {
          // If empty, old format, or doesn't match the new partner1 name, generate a new personalized one!
          update.everBondId = generatePersonalId(partner1);
        } else {
          update.everBondId = existingId;
        }

        if (partnerEverBondId !== undefined) update.partnerEverBondId = partnerEverBondId;
        if (connectionStatus !== undefined) update.connectionStatus = connectionStatus;
        if (relationshipDate !== undefined) update.relationshipDate = relationshipDate;
        
        // Legacy partnership linking states
        if (partnerLinked !== undefined) update.partnerLinked = partnerLinked;
        if (partnerAccepted !== undefined) update.partnerAccepted = partnerAccepted;
        if (verificationStatus !== undefined) update.verificationStatus = verificationStatus;
        if (invitationCode !== undefined) update.invitationCode = invitationCode;
        if (partnerId !== undefined) update.partnerId = partnerId;
        if (relationshipId !== undefined) update.relationshipId = relationshipId;
        
        if (!wasCompleted) {
          get().addNotification({
            type: 'system',
            title: 'Welcome to EverBond Wealth',
            description: `Dashboard initialized for ${partner1 || 'User'}. Start monitoring and planning your capital splits.`
          });
          
          get().addTimelineEvent({
            type: 'profile',
            title: 'Profile Created',
            description: `Identity nodes created under the name: ${partner1 || 'User'}.`,
            createdBy: 'System'
          });
        } else {
          get().addNotification({
            type: 'system',
            title: 'Profile Updated',
            description: 'Your user profile details have been saved.'
          });

          get().addTimelineEvent({
            type: 'system',
            title: 'Profile Updated',
            description: `Personal information and region parameters updated.`
          });
        }

        set(update);
        get().syncInsightsData();
      },

      setP1Salary: v => {
        const old = get().p1Salary;
        if (v !== old) {
          get().addNotification({
            type: 'financial',
            title: 'Income Added',
            description: `Primary salary updated to ${get().currency} ${v.toLocaleString()}.`
          });
          get().addTimelineEvent({
            type: 'financial',
            title: 'Income Added',
            description: `Primary salary updated to ${get().currency} ${v.toLocaleString()}.`
          });
        }
        set({ p1Salary: v });
        get().syncInsightsData();
      },
      setP2Salary: v => {
        const old = get().p2Salary;
        if (v !== old && v > 0) {
          get().addNotification({
            type: 'financial',
            title: 'Income Added',
            description: `Partner salary updated to ${get().currency} ${v.toLocaleString()}.`
          });
          get().addTimelineEvent({
            type: 'financial',
            title: 'Income Added',
            description: `Partner salary updated to ${get().currency} ${v.toLocaleString()}.`
          });
        }
        set({ p2Salary: v });
        get().syncInsightsData();
      },
      setMode:     v => {
        const old = get().mode;
        if (v !== old) {
          get().addNotification({
            type: 'system',
            title: 'Settings Saved',
            description: `Financial allocation mindset set to ${v}.`
          });
          get().addTimelineEvent({
            type: 'system',
            title: 'Settings Updated',
            description: `Financial allocation split mindset adjusted to "${v}".`
          });
        }
        set({ mode: v, mindset: v });
        get().syncInsightsData();
      },
      setCurrency: v => {
        const old = get().currency;
        if (v !== old) {
          get().addNotification({
            type: 'system',
            title: 'Settings Saved',
            description: `Currency preferences updated to ${v}.`
          });
          get().addTimelineEvent({
            type: 'system',
            title: 'Settings Updated',
            description: `System presentation currency changed to "${v}".`
          });
        }
        set({ currency: v });
        get().syncInsightsData();
      },
      setSimYears: v => {
        const old = get().simYears;
        if (v !== old) {
          get().addTimelineEvent({
            type: 'system',
            title: 'Simulation Generated',
            description: `Wealth projection range calibrated to ${v} Years.`
          });
        }
        set({ simYears: v });
        get().syncInsightsData();
      },
      setSimReturn:v => { set({ simReturn: v }); get().syncInsightsData(); },
      setGoalTargets: t => {
        const oldTargets = get().goalTargets;
        Object.keys(t).forEach(key => {
          if (t[key] !== oldTargets[key]) {
            const names = {
              child: 'Child Education',
              retirement: 'Retirement Corpus',
              house: 'Home Purchase',
              vacation: 'Vacation / Travel'
            };
            const name = names[key] || key;
            if (oldTargets[key] === undefined || oldTargets[key] === 0) {
              if (t[key] > 0) {
                get().addNotification({
                  type: 'financial',
                  title: 'Goal Created',
                  description: `Created a new target of ${get().currency} ${t[key].toLocaleString()} for ${name}.`
                });
                get().addTimelineEvent({
                  type: 'goal',
                  title: 'Goal Created',
                  description: `Dream target for "${name}" established at ${get().currency} ${t[key].toLocaleString()}.`
                });
              }
            } else if (t[key] !== oldTargets[key]) {
              get().addNotification({
                type: 'financial',
                title: 'Goal Updated',
                description: `Updated target for ${name} to ${get().currency} ${t[key].toLocaleString()}.`
              });
              get().addTimelineEvent({
                type: 'goal',
                title: 'Goal Updated',
                description: `Target parameter for "${name}" updated to ${get().currency} ${t[key].toLocaleString()}.`
              });
            }
          }
        });
        set({ goalTargets: t });
        get().syncInsightsData();
      },

      // Milestone Actions
      addMilestone: (m) => {
        const newMilestone = { ...m, id: Date.now(), createdAt: new Date().toISOString() };
        get().addNotification({
          type: 'financial',
          title: 'Milestone Created',
          description: `New financial milestone created: "${m.name || 'Untitled'}".`
        });
        get().addTimelineEvent({
          type: 'financial',
          title: 'Goal Created',
          description: `Linear milestone goal "${m.name || 'Untitled'}" scheduled for ${m.targetDate}.`
        });
        set(s => ({ milestones: [...s.milestones, newMilestone] }));
        get().syncInsightsData();
      },

      updateMilestone: (id, patch) => {
        const oldMilestones = get().milestones;
        const oldM = oldMilestones.find(m => m.id === id);
        
        if (oldM) {
          const wasAchieved = oldM.monthlySaved >= oldM.targetCost;
          const isNowAchieved = patch.monthlySaved !== undefined && patch.monthlySaved >= oldM.targetCost;
          
          if (!wasAchieved && isNowAchieved) {
            get().addNotification({
              type: 'financial',
              title: 'Milestone Achieved!',
              description: `Congratulations! You've achieved your target of ${get().currency} ${oldM.targetCost.toLocaleString()} for "${oldM.name}".`
            });
            get().addTimelineEvent({
              type: 'financial',
              title: 'Goal Completed',
              description: `Target of ${get().currency} ${oldM.targetCost.toLocaleString()} met for "${oldM.name}"!`,
              isMilestone: true
            });
            get().addTimelineEvent({
              type: 'financial',
              title: 'Milestone Achieved',
              description: `Successfully indexed 100% savings for "${oldM.name}".`,
              isMilestone: true
            });
          } else if (patch.monthlySaved !== undefined && patch.monthlySaved !== oldM.monthlySaved) {
            get().addNotification({
              type: 'financial',
              title: 'Milestone Updated',
              description: `Saved amount for "${oldM.name}" updated to ${get().currency} ${patch.monthlySaved.toLocaleString()}.`
            });
          }
        }
        set(s => ({
          milestones: s.milestones.map(m => m.id === id ? { ...m, ...patch } : m)
        }));
        get().syncInsightsData();
      },

      removeMilestone: (id) => {
        const m = get().milestones.find(mil => mil.id === id);
        if (m) {
          get().addNotification({
            type: 'financial',
            title: 'Milestone Removed',
            description: `Milestone "${m.name}" has been deleted.`
          });
          get().addTimelineEvent({
            type: 'financial',
            title: 'Settings Updated',
            description: `Milestone "${m.name}" removed from planning blueprint.`
          });
        }
        set(s => ({
          milestones: s.milestones.filter(mil => mil.id !== id)
        }));
        get().syncInsightsData();
      },

      getTotalSalary: () => {
        const { p1Salary, p2Salary, stage } = get();
        // Single stage only has P1 Salary
        if (stage === 'Single') return p1Salary || 0;
        return (p1Salary || 0) + (p2Salary || 0);
      },

      reset: () => {
        const newId = generateEverBondId();
        set({
          started: false,
          onboardingComplete: false,
          stage: 'Single',
          relationshipStage: 'Single',
          theme: 'light',
          partner1: '',
          userName: '',
          partner2: '',
          partnerName: '',
          region: 'India',
          country: 'India',
          currency: 'INR',
          dreamGoals: [],
          mindset: 'Balanced',
          invitationAccepted: false,
          selfieUploaded: false,
          selfieUrl: '',
          accountsConnected: false,
          relationshipVerified: false,
          
          // Reset EverBond ID system (regenerate fresh ID)
          everBondId: newId,
          coupleId: '',
          familyId: '',
          partnerEverBondId: '',
          connectionStatus: 'none',
          requestSentAt: null,
          relationshipDate: '',
          relationshipId: '',
          requestSent: false,
          requestReceived: false,
          connectedAt: null,
          incomingRequest: null,

          // Reset legacy partner linking state
          partnerLinked: false,
          partnerAccepted: false,
          verificationStatus: 'unverified',
          invitationCode: '',
          partnerId: '',

          notifications: [
            {
              id: 'welcome-init',
              type: 'system',
              title: 'Welcome to EverBond Wealth',
              description: 'Your premium shared financial journey starts here. Explore milestones, set goals, and connect your nodes.',
              isRead: false,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'partner-request-sent',
              type: 'partner',
              title: 'Partner Connection Request Sent',
              description: 'An invitation code has been generated. Share it with your partner to link dashboards.',
              isRead: false,
              createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
            },
            {
              id: 'income-added-init',
              type: 'financial',
              title: 'Income Added Successfully',
              description: 'Primary income node recorded. Your allocation splits are computed automatically.',
              isRead: true,
              createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
              id: 'goal-created-init',
              type: 'financial',
              title: 'Financial Goal Created',
              description: 'A new Retirement target has been initialized under your wealth blueprint.',
              isRead: true,
              createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            },
            {
              id: 'relationship-journey-updated',
              type: 'relationship',
              title: 'Relationship Journey Updated',
              description: 'Unlock Couple and Family Dynasty dashboards by progressing through life stages.',
              isRead: true,
              createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
            }
          ],

          timelineEvents: [
            {
              eventId: 'ev-welcome',
              type: 'system',
              title: 'Welcome to EverBond Wealth',
              description: 'Your premium wealth planning workspace has been initialized.',
              createdBy: 'System',
              isMilestone: false,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              eventId: 'ev-profile',
              type: 'profile',
              title: 'Profile Created',
              description: 'Identity parameters established for your EverBond node.',
              createdBy: 'System',
              isMilestone: false,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              eventId: 'ev-income',
              type: 'financial',
              title: 'Income Added',
              description: 'Primary income node recorded. Allocation engine active.',
              createdBy: 'Solo Builder',
              isMilestone: false,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              eventId: 'ev-goal',
              type: 'goal',
              title: 'Goal Created',
              description: 'Retirement Corpus goal added to wealth blueprint.',
              createdBy: 'Solo Builder',
              isMilestone: false,
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
              eventId: 'ev-partner-req',
              type: 'relationship',
              title: 'Partner Connection Request Sent',
              description: 'Cryptographic invite generated. Waiting for partner ledger handshake.',
              createdBy: 'Solo Builder',
              isMilestone: false,
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
          ],

          onboardingSingle: {
            name: '',
            age: '',
            country: 'India',
            income: '',
            careerStage: '',
            financialGoals: '',
          },
          onboardingCommitted: {
            name: '',
            partnerName: '',
            anniversaryDate: '',
            combinedGoals: '',
          },
          onboardingMarried: {
            partnerName: '',
            familyGoals: '',
            childPlans: '',
            currentSavings: '',
            futurePlanningGoals: '',
          },
          p1Salary: 100000,
          p2Salary: 0,
          mode: 'Balanced',
          simYears: 10,
          simReturn: null,
          milestones: [],
          goalTargets: {
            child: 5000000,
            retirement: 20000000,
            house: 8000000,
            vacation: 500000,
          },
          historicalNetWorth: [],
          incomeHistory: [],
          expenseHistory: [],
          goalProgress: [],
          wealthForecast: [],
          savingsRate: null,
          partnerWealthData: null,
        });
      },
    }),
    { name: 'eb_v6' }
  )
);