/**
 * usePartnerStatus.js
 * Real-time Firestore listener for the current user's partner connection status.
 * Subscribes to users/{currentUid} and syncs changes to Zustand store.
 */

import { useState, useEffect, useRef } from 'react';
import { db } from '../utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFinanceStore } from '../store/useFinanceStore';

/**
 * @typedef {Object} PartnerStatus
 * @property {boolean} isConnected
 * @property {string|null} partnerUid
 * @property {string|null} partnerEbId
 * @property {string|null} partnerName
 * @property {string|null} workspaceId
 * @property {'connected'|'none'|null} partnerStatus
 * @property {boolean} loading
 * @property {string|null} error
 */

/**
 * Real-time partner status hook — syncs Firestore → Zustand store.
 * @param {string|null|undefined} currentUid
 * @returns {PartnerStatus}
 */
export function usePartnerStatus(currentUid) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read partner state from Zustand (already synced by this hook)
  const partnerUid = useFinanceStore(s => s.partnerId);
  const partnerEbId = useFinanceStore(s => s.partnerEverBondId);
  const partnerName = useFinanceStore(s => s.partnerName);
  const workspaceId = useFinanceStore(s => s.workspaceId);
  const connectionStatus = useFinanceStore(s => s.connectionStatus);

  const isConnected = connectionStatus === 'connected' && !!partnerUid;

  useEffect(() => {
    if (!currentUid || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const userRef = doc(db, 'users', currentUid);

    const unsub = onSnapshot(
      userRef,
      async (snap) => {
        if (!snap.exists()) {
          setLoading(false);
          return;
        }

        const data = snap.data();
        const newPartnerUid = data.partnerUid || data.partnerId || '';
        const newPartnerEbId = data.partnerEbId || '';
        const newPartnerStatus = data.partnerStatus || 'none';
        const newWorkspaceId = data.workspaceId || '';

        // Fetch partner's name if we have a partnerUid
        let resolvedPartnerName = data.partnerName || '';
        if (newPartnerUid && !resolvedPartnerName) {
          try {
            const { getDoc, doc: fsDoc } = await import('firebase/firestore');
            const partnerSnap = await getDoc(fsDoc(db, 'users', newPartnerUid));
            if (partnerSnap.exists()) {
              resolvedPartnerName = partnerSnap.data().fullName || '';
            }
          } catch (e) {
            console.warn('[usePartnerStatus] Could not fetch partner name:', e);
          }
        }

        // Sync to Zustand store
        useFinanceStore.setState({
          partnerId: newPartnerUid,
          partnerEverBondId: newPartnerEbId,
          partnerLinked: newPartnerStatus === 'connected',
          partnerName: resolvedPartnerName,
          partner2: resolvedPartnerName,
          connectionStatus: newPartnerStatus === 'connected' ? 'connected' : 'none',
          workspaceId: newWorkspaceId,
          // Sync mode / stage if connected
          ...(newPartnerStatus === 'connected' && {
            stage: 'Committed',
            relationshipStage: 'Committed',
            relationshipStatus: 'Committed',
          }),
          ...((newPartnerStatus !== 'connected' && !newPartnerUid) && {
            stage: data.stage || 'Single',
            relationshipStage: data.stage || 'Single',
            relationshipStatus: data.stage || 'Single',
          }),
        });

        setLoading(false);
      },
      (err) => {
        console.error('[usePartnerStatus] listener error:', err);
        setError('Could not sync partner status. Check your connection.');
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUid]);

  return {
    isConnected,
    partnerUid,
    partnerEbId,
    partnerName,
    workspaceId,
    partnerStatus: connectionStatus === 'connected' ? 'connected' : 'none',
    loading,
    error,
  };
}
