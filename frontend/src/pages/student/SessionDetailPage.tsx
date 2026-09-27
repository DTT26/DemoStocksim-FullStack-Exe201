import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { journalService } from '../../services/journalService';
import type { JournalSession } from '../../features/journal/types/journalTypes';
import { SessionHeader } from '../../features/journal/components/SessionHeader';
import { SessionTabs, type JournalTabId } from '../../features/journal/components/SessionTabs';
import { OverviewTab } from '../../features/journal/components/OverviewTab';
import { AnalysisTab } from '../../features/journal/components/AnalysisTab';
import { BreakdownTab } from '../../features/journal/components/BreakdownTab';
import { TradesTab } from '../../features/journal/components/TradesTab';
import { JournalSkeleton } from '../../features/journal/components/JournalSkeleton';
import { JournalErrorState } from '../../features/journal/components/JournalErrorState';

export const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<JournalSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<JournalTabId>('overview');

  const fetchSession = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await journalService.getSessionById(sessionId);
      if (data) {
        setSession(data);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error('Failed to load session details', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <JournalSkeleton />;
  }

  if (error || !session) {
    return (
      <JournalErrorState
        title="Session not found"
        message="The requested trading session could not be loaded or does not exist."
        onRetry={() => navigate('/student/journal')}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Session Top Header */}
      <SessionHeader session={session} />

      {/* 4 Tabs: Overview | Analysis | Breakdown | Trades */}
      <SessionTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        tradesCount={session.trades?.length || session.tradesCount}
      />

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'overview' && <OverviewTab session={session} />}
        {activeTab === 'analysis' && <AnalysisTab session={session} />}
        {activeTab === 'breakdown' && <BreakdownTab session={session} />}
        {activeTab === 'trades' && <TradesTab session={session} />}
      </div>
    </div>
  );
};
