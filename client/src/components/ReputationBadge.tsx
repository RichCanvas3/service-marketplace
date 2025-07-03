import React from 'react';
import { ReputationManager } from '../utils/reputationManager';

interface ReputationBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showTrend?: boolean;
  className?: string;
}

const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  size = 'medium',
  showTrend = false,
  className = ''
}) => {
  const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
  const isVerified = ReputationManager.isVerifiedCustomer();
  const reputationTrend = ReputationManager.getReputationTrend(7);

  const score = mcoData.kycCredibilityScore || 85;
  const totalServices = mcoData.totalServicesCompleted || 0;
  const streakCount = mcoData.streakCount || 0;

  const getScoreColor = (score: number) => {
    if (score >= 95) return { bg: '#22c55e', text: '#ffffff', name: 'Excellent' };
    if (score >= 90) return { bg: '#16a34a', text: '#ffffff', name: 'Very Good' };
    if (score >= 80) return { bg: '#eab308', text: '#000000', name: 'Good' };
    if (score >= 70) return { bg: '#f97316', text: '#ffffff', name: 'Fair' };
    return { bg: '#ef4444', text: '#ffffff', name: 'Needs Work' };
  };

  const scoreInfo = getScoreColor(score);
  const hasPositiveTrend = reputationTrend.length > 1 &&
    reputationTrend[0].score > reputationTrend[reputationTrend.length - 1].score;

  const sizeStyles = {
    small: { fontSize: '12px', padding: '4px 8px', iconSize: '14px' },
    medium: { fontSize: '14px', padding: '6px 12px', iconSize: '16px' },
    large: { fontSize: '16px', padding: '8px 16px', iconSize: '18px' }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`reputation-badge ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap'
    }}>
      {/* Main Reputation Score */}
      <div style={{
        background: scoreInfo.bg,
        color: scoreInfo.text,
        borderRadius: '20px',
        fontSize: currentSize.fontSize,
        fontWeight: '600',
        padding: currentSize.padding,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span>{score}/100</span>
        {showTrend && hasPositiveTrend && (
          <span style={{ fontSize: currentSize.iconSize }}>↗️</span>
        )}
      </div>

      {/* Verified Customer Badge */}
      {isVerified && (
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          borderRadius: '15px',
          fontSize: currentSize.fontSize,
          fontWeight: '500',
          padding: currentSize.padding,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
        }}>
          <span style={{ fontSize: currentSize.iconSize }}>✓</span>
          <span>Verified</span>
        </div>
      )}

      {/* Service Streak Badge */}
      {streakCount >= 3 && (
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          borderRadius: '15px',
          fontSize: currentSize.fontSize,
          fontWeight: '500',
          padding: currentSize.padding,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
        }}>
          <span style={{ fontSize: currentSize.iconSize }}>🔥</span>
          <span>{streakCount} Streak</span>
        </div>
      )}
    </div>
  );
};

export default ReputationBadge;