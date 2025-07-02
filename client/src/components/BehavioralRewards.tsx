import React, { useState, useEffect } from 'react';
import { ReputationManager } from '../utils/reputationManager';

interface BehavioralRewardsProps {
  compact?: boolean;
  showProgress?: boolean;
}

const BehavioralRewards: React.FC<BehavioralRewardsProps> = ({
  compact = false,
  showProgress = true
}) => {
  const [newRewards, setNewRewards] = useState<any[]>([]);
  const [mcoData, setMcoData] = useState<any>({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('mcoData') || '{}');
    setMcoData(data);

    // Check for new behavioral rewards
    const behavioralRewards = ReputationManager.checkBehavioralRewards();
    setNewRewards(behavioralRewards);

    // Auto-apply new rewards
    if (behavioralRewards.length > 0) {
      const updatedData = { ...data };
      if (!updatedData.rewards) updatedData.rewards = [];

      behavioralRewards.forEach(reward => {
        updatedData.rewards.push({
          ...reward,
          active: true,
          dateEarned: new Date().toISOString()
        });
        updatedData.loyaltyPoints = (updatedData.loyaltyPoints || 0) + reward.points;
      });

      localStorage.setItem('mcoData', JSON.stringify(updatedData));
      setMcoData(updatedData);
    }
  }, []);

  const activeRewards = mcoData.rewards?.filter((r: any) => r.active) || [];
  const streakCount = mcoData.streakCount || 0;
  const totalSpent = mcoData.pastTransactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
  const avgRating = mcoData.averageRatingGiven || 0;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'streak': return '🔥';
      case 'milestone': return '🏆';
      case 'rating': return '⭐';
      case 'frequency': return '📈';
      default: return '🎁';
    }
  };

  const getProgressToNextMilestone = () => {
    const milestones = [
      { points: 500, name: 'Premium Customer', current: totalSpent },
      { points: 1000, name: 'Elite Member', current: totalSpent },
      { points: 5, name: '5-Service Streak', current: streakCount },
      { points: 10, name: '10-Service Streak', current: streakCount }
    ];

    return milestones
      .filter(m => m.current < m.points)
      .map(m => ({
        ...m,
        progress: (m.current / m.points) * 100,
        remaining: m.points - m.current
      }));
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {activeRewards.slice(0, 2).map((reward: any, index: number) => (
          <div key={index} style={{
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)'
          }}>
            <span>{getRewardIcon(reward.type)}</span>
            <span>+{reward.points}</span>
          </div>
        ))}
        {activeRewards.length > 2 && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            +{activeRewards.length - 2} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="behavioral-rewards" style={{
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        color: '#8b5cf6',
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>🎯</span>
        Behavioral Rewards
      </h3>

      {/* Active Rewards */}
      {activeRewards.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            Active Rewards
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {activeRewards.map((reward: any, index: number) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {getRewardIcon(reward.type)}
                  </span>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '14px',
                      color: '#333'
                    }}>
                      {reward.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {reward.description}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  +{reward.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress to Next Milestones */}
      {showProgress && (
        <div>
          <h4 style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 12px 0',
            fontWeight: '600'
          }}>
            Progress to Next Rewards
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {getProgressToNextMilestone().slice(0, 3).map((milestone, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {milestone.name}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {milestone.remaining} away
                  </span>
                </div>
                <div style={{
                  background: '#f3f4f6',
                  borderRadius: '8px',
                  height: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                    height: '100%',
                    width: `${Math.min(milestone.progress, 100)}%`,
                    transition: 'width 0.3s ease',
                    borderRadius: '8px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Rewards Notification */}
      {newRewards.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          borderRadius: '12px',
          padding: '12px 16px',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
        }}>
          <span style={{ fontSize: '20px' }}>🎉</span>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              New Rewards Unlocked!
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              You've earned {newRewards.reduce((sum, r) => sum + r.points, 0)} bonus points
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehavioralRewards;