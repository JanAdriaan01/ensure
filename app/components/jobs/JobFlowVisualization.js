// app/components/jobs/JobFlowVisualization.jsx
'use client';

import { useState, useEffect } from 'react';
import { useFetch } from '@/app/hooks/useFetch';
import { useToast } from '@/app/hooks/useToast';
import Button from '@/app/components/ui/Button/Button';
import Modal from '@/app/components/ui/Modal/Modal';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

export default function JobFlowVisualization({ jobId, onStageChange }) {
  const { data: flowData, loading, refetch } = useFetch(`/api/jobs/${jobId}/flow`);
  const { showToast } = useToast();
  const [showBlockersModal, setShowBlockersModal] = useState(false);
  const [forceAdvance, setForceAdvance] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const stages = [
    { key: 'QUOTE', label: '📋 Quote', color: '#3b82f6' },
    { key: 'PO_RECEIVED', label: '📄 PO Received', color: '#10b981' },
    { key: 'MATERIAL_PURCHASED', label: '📦 Material Purchased', color: '#f59e0b' },
    { key: 'RESOURCE_ASSIGNED', label: '👥 Resource Assigned', color: '#8b5cf6' },
    { key: 'TOOLS_ASSIGNED', label: '🔧 Tools Assigned', color: '#ec4899' },
    { key: 'WORK_COMPLETED', label: '✅ Work Completed', color: '#10b981' },
    { key: 'RECON_TO_PO', label: '🔄 Recon to PO', color: '#06b6d4' },
    { key: 'MONTHLY_BILLING', label: '💰 Monthly Billing', color: '#f59e0b' },
    { key: 'PAYMENTS_LOGGED', label: '💵 Payments Logged', color: '#10b981' },
    { key: 'PO_COMPLETE', label: '🏁 PO Complete', color: '#10b981' }
  ];

  const getStageStatus = (stageKey) => {
    const stage = flowData?.stages?.find(s => s.stage_name === stageKey);
    if (!stage) return 'pending';
    if (stage.completed) return 'completed';
    if (flowData?.current_stage === stageKey) return 'current';
    return 'pending';
  };

  const canAdvance = () => {
    return flowData?.can_advance === true;
  };

  const getBlockers = () => {
    return flowData?.blockers?.filter(b => b.stage === flowData?.current_stage)?.[0]?.blockers || [];
  };

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_stage: getNextStage(),
          force_advance: forceAdvance
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Advanced to next stage`, 'success');
        refetch();
        if (onStageChange) onStageChange();
        setForceAdvance(false);
      } else {
        if (data.blockers?.length) {
          showToast(`Cannot advance: ${data.blockers[0]?.message}`, 'error');
          setShowBlockersModal(true);
        } else {
          showToast(data.error || 'Failed to advance', 'error');
        }
      }
    } catch (error) {
      showToast('Failed to advance stage', 'error');
    } finally {
      setAdvancing(false);
    }
  };

  const getNextStage = () => {
    const currentIndex = stages.findIndex(s => s.key === flowData?.current_stage);
    return stages[currentIndex + 1]?.key;
  };

  if (loading) return <LoadingSpinner size="sm" text="Loading flow..." />;

  const blockers = getBlockers();
  const nextStage = getNextStage();
  const hasNextStage = !!nextStage;

  return (
    <div className="job-flow">
      <div className="flow-header">
        <h3>Business Process Flow</h3>
        {hasNextStage && (
          <Button 
            onClick={handleAdvance} 
            disabled={advancing || (!canAdvance() && !forceAdvance)}
            variant={canAdvance() ? 'success' : 'secondary'}
          >
            {advancing ? 'Processing...' : `Advance to ${stages.find(s => s.key === nextStage)?.label}`}
          </Button>
        )}
      </div>

      <div className="flow-stages">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.key);
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.key} className="flow-stage-container">
              <div className={`flow-stage ${status}`}>
                <div className="stage-icon" style={{ background: stage.color }}>
                  {stage.label.split(' ')[0]}
                </div>
                <div className="stage-label">{stage.label}</div>
                {status === 'current' && (
                  <div className="stage-badge current">Current</div>
                )}
                {status === 'completed' && (
                  <div className="stage-badge completed">✓</div>
                )}
              </div>
              {!isLast && (
                <div className={`stage-connector ${status === 'completed' ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {blockers.length > 0 && (
        <div className="flow-warnings">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <strong>Cannot advance to next stage</strong>
            <ul>
              {blockers.map((blocker, idx) => (
                <li key={idx}>{blocker.message}</li>
              ))}
            </ul>
            <button 
              className="force-advance-btn"
              onClick={() => setForceAdvance(true)}
            >
              Force Advance (Override)
            </button>
          </div>
        </div>
      )}

      <Modal 
        isOpen={showBlockersModal} 
        onClose={() => setShowBlockersModal(false)} 
        title="Stage Transition Blocked"
      >
        <div className="blockers-modal">
          <p>The following requirements must be met before advancing:</p>
          <ul>
            {blockers.map((blocker, idx) => (
              <li key={idx}>❌ {blocker.message}</li>
            ))}
          </ul>
          <div className="modal-actions">
            <Button onClick={() => setShowBlockersModal(false)}>Close</Button>
            <Button 
              variant="danger" 
              onClick={() => {
                setForceAdvance(true);
                setShowBlockersModal(false);
                handleAdvance();
              }}
            >
              Force Advance Anyway
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .job-flow {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .flow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .flow-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .flow-stages {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .flow-stage-container {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 100px;
        }

        .flow-stage {
          position: relative;
          text-align: center;
          flex: 1;
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: #f3f4f6;
          transition: all 0.2s;
        }

        .flow-stage.completed {
          background: #d1fae5;
          border: 1px solid #10b981;
        }

        .flow-stage.current {
          background: #dbeafe;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
        }

        .stage-icon {
          width: 40px;
          height: 40px;
          margin: 0 auto 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }

        .stage-label {
          font-size: 0.7rem;
          font-weight: 500;
        }

        .stage-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: bold;
        }

        .stage-badge.current {
          background: #3b82f6;
          color: white;
        }

        .stage-badge.completed {
          background: #10b981;
          color: white;
        }

        .stage-connector {
          width: 30px;
          height: 2px;
          background: #d1d5db;
          margin: 0 0.5rem;
        }

        .stage-connector.completed {
          background: #10b981;
        }

        .flow-warnings {
          margin-top: 1rem;
          padding: 1rem;
          background: #fef3c7;
          border-radius: 0.5rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .warning-icon {
          font-size: 1.25rem;
        }

        .warning-content {
          flex: 1;
        }

        .warning-content ul {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }

        .force-advance-btn {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.75rem;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 0.5rem;
        }

        .blockers-modal ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .flow-stages {
            flex-direction: column;
            align-items: stretch;
          }
          .stage-connector {
            width: 2px;
            height: 20px;
            margin: 0.25rem auto;
          }
          .flow-stage-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}