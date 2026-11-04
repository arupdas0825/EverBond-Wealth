/**
 * usePartnerStatus.js — Migrated from Firestore to MongoDB + Socket.IO
 * Real-time synchronization for partner connection status.
 * Zero Firestore dependencies.
 */

import { useState, useEffect, useCallback } from 'react';
import { auth } from '../utils/firebase';
import { useFinanceStore } from '../store/useFinanceStore';
import { getPartnerStatus } from '../services/partnerService';
import { subscribeToEvent, connectSocket } from '../services/socketService';

export function usePartnerStatus(currentUid) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const partnerUid = useFinanceStore((s) => s.partnerId);
  const partnerEbId = useFinanceStore((s) => s.partnerEverBondId);
  const partnerName = useFinanceStore((s) => s.partnerName);
  const partnerPhoto = useFinanceStore((s) => s.partnerPhoto);
  const workspaceId = useFinanceStore((s) => s.workspaceId);
  const connectionStatus = useFinanceStore((s) => s.connectionStatus);
  const connectedAt = useFinanceStore((s) => s.connectedAt);

  const isConnected = connectionStatus === 'connected' && !!partnerUid;

  const fetchStatus = useCallback(async () => {
    if (!auth?.currentUser) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getPartnerStatus();

      const isNowConnected = data.isConnected;
      const parsedConnectedAt = data.connectedAt ? new Date(data.connectedAt) : null;

      useFinanceStore.setState({
        partnerId: data.partnerUid || '',
        partnerEverBondId: data.partnerEbId || '',
        partnerLinked: isNowConnected,
        partnerName: data.partnerName || '',
        partnerPhoto: data.partnerPhoto || '',
        partner2: data.partnerName || '',
        connectionStatus: isNowConnected ? 'connected' : 'none',
        workspaceId: data.workspaceId || '',
        connectedAt: parsedConnectedAt,
        ...(isNowConnected && {
          stage: 'Committed',
          relationshipStage: 'Committed',
          relationshipStatus: 'Committed',
        }),
        ...(!isNowConnected &&
          !data.partnerUid && {
            stage: 'Single',
            relationshipStage: 'Single',
            relationshipStatus: 'Single',
          }),
      });
    } catch (err) {
      console.warn('[usePartnerStatus] Error fetching status:', err.message);
      if (err.message !== 'UNAUTHENTICATED') {
        setError('Could not sync partner status.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUid || !auth?.currentUser) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchStatus();

    // Ensure socket connected
    connectSocket();

    // Listen to real-time events
    const unsubConnected = subscribeToEvent('partner:connected', (payload) => {
      console.log('[usePartnerStatus] Real-time event: partner:connected', payload);
      const partner = payload.partner || {};
      useFinanceStore.setState({
        partnerId: partner.uid || '',
        partnerEverBondId: partner.ebId || '',
        partnerLinked: true,
        partnerName: partner.name || 'Partner',
        partnerPhoto: partner.photo || '',
        partner2: partner.name || 'Partner',
        connectionStatus: 'connected',
        workspaceId: payload.workspaceId || '',
        connectedAt: payload.connectedAt ? new Date(payload.connectedAt) : new Date(),
        stage: 'Committed',
        relationshipStage: 'Committed',
        relationshipStatus: 'Committed',
      });
      setLoading(false);
    });

    const unsubDisconnected = subscribeToEvent('partner:disconnected', () => {
      console.log('[usePartnerStatus] Real-time event: partner:disconnected');
      useFinanceStore.setState({
        partnerId: '',
        partnerEverBondId: '',
        partnerLinked: false,
        partnerName: '',
        partnerPhoto: '',
        partner2: '',
        connectionStatus: 'none',
        workspaceId: '',
        connectedAt: null,
        stage: 'Single',
        relationshipStage: 'Single',
        relationshipStatus: 'Single',
      });
      setLoading(false);
    });

    const unsubSocketReconnect = subscribeToEvent('socket:connected', () => {
      // Re-fetch authoritative status on reconnect to recover from any missed events (Phase 21)
      fetchStatus();
    });

    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubSocketReconnect();
    };
  }, [currentUid, fetchStatus]);

  const connectionHealth = isConnected ? 'good' : 'unknown';

  return {
    isConnected,
    partnerUid,
    partnerEbId,
    partnerName,
    partnerPhoto,
    workspaceId,
    connectedAt,
    connectionHealth,
    partnerStatus: connectionStatus === 'connected' ? 'connected' : 'none',
    loading,
    error,
    refreshStatus: fetchStatus,
  };
}
