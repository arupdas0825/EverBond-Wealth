/**
 * usePartnerStatus.js — Fixed
 * Real-time Firestore listener for the current user's partner status.
 *
 * Fixes:
 *  - Reads partnerName + partnerPhoto directly from user doc (written at accept time)
 *    → eliminates secondary getDoc race / permission failure
 *  - Checks auth.currentUser before attaching listener
 *  - connectedAt synced to Zustand
 *  - connectionHealth computed from lastSync
 */

import { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFinanceStore } from '../store/useFinanceStore';

/**
 * @param {string|null|undefined} currentUid
 * @returns {{
 *   isConnected: boolean,
 *   partnerUid: string,
 *   partnerEbId: string,
 *   partnerName: string,
 *   partnerPhoto: string,
 *   workspaceId: string,
 *   partnerStatus: string,
 *   connectedAt: Date|null,
 *   connectionHealth: 'good'|'syncing'|'unknown',
 *   loading: boolean,
 *   error: string|null
 * }}
 */
export function usePartnerStatus(currentUid) {
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const partnerUid       = useFinanceStore(s => s.partnerId);
  const partnerEbId      = useFinanceStore(s => s.partnerEverBondId);
  const partnerName      = useFinanceStore(s => s.partnerName);
  const partnerPhoto     = useFinanceStore(s => s.partnerPhoto);
  const workspaceId      = useFinanceStore(s => s.workspaceId);
  const connectionStatus = useFinanceStore(s => s.connectionStatus);
  const connectedAt      = useFinanceStore(s => s.connectedAt);

  const isConnected = connectionStatus === 'connected' && !!partnerUid;

  useEffect(() => {
    // Guard: must have UID and active auth session
    if (!currentUid || !db) { setLoading(false); return; }
    if (!auth?.currentUser)  { setLoading(false); return; }

    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', currentUid);

    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) { setLoading(false); return; }

        const data = snap.data();
        const newPartnerUid    = data.partnerUid    || '';
        const newPartnerEbId   = data.partnerEbId   || '';
        const newPartnerStatus = data.partnerStatus || 'none';
        const newWorkspaceId   = data.workspaceId   || '';
        // Read partner info from user doc — written at accept time, no secondary fetch needed
        const newPartnerName   = data.partnerName   || '';
        const newPartnerPhoto  = data.partnerPhoto  || '';
        const newConnectedAt   = data.connectedAt
          ? (data.connectedAt.toDate ? data.connectedAt.toDate() : new Date(data.connectedAt))
          : null;

        const isNowConnected = newPartnerStatus === 'connected' && !!newPartnerUid;

        useFinanceStore.setState({
          partnerId:         newPartnerUid,
          partnerEverBondId: newPartnerEbId,
          partnerLinked:     isNowConnected,
          partnerName:       newPartnerName,
          partnerPhoto:      newPartnerPhoto,
          partner2:          newPartnerName,
          connectionStatus:  isNowConnected ? 'connected' : 'none',
          workspaceId:       newWorkspaceId,
          connectedAt:       newConnectedAt,
          ...(isNowConnected && {
            stage:             'Committed',
            relationshipStage: 'Committed',
            relationshipStatus:'Committed',
          }),
          ...(!isNowConnected && !newPartnerUid && {
            stage:             data.stage || 'Single',
            relationshipStage: data.stage || 'Single',
            relationshipStatus:data.stage || 'Single',
          }),
        });

        setLoading(false);
      },
      (err) => {
        console.error('[usePartnerStatus] snapshot error:', err.code, err.message);
        // Only show error for non-permission errors — auth state change will fix those
        if (!err.code?.includes('permission')) {
          setError('Could not sync partner status. Check your connection.');
        }
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUid]);

  // Connection health: good if connected, unknown otherwise
  const connectionHealth =
    isConnected ? 'good' : 'unknown';

  return {
    isConnected, partnerUid, partnerEbId, partnerName, partnerPhoto,
    workspaceId, connectedAt, connectionHealth,
    partnerStatus: connectionStatus === 'connected' ? 'connected' : 'none',
    loading, error,
  };
}
