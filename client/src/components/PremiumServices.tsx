import React from 'react';
import { ReputationManager } from '../utils/reputationManager';

interface PremiumService {
  name: string;
  price: string;
  description: string;
  reputationRequired: number;
  exclusive?: boolean;
}

interface PremiumServicesProps {
  serviceName: string;
  premiumServices: PremiumService[];
  onSelectService?: (serviceName: string) => void;
}

const PremiumServices: React.FC<PremiumServicesProps> = ({
  serviceName,
  premiumServices,
  onSelectService
}) => {
  const mcoData = JSON.parse(localStorage.getItem('mcoData') || '{}');
  const isVerified = ReputationManager.isVerifiedCustomer();
  const reputationScore = mcoData.kycCredibilityScore || 85;
  const totalServices = mcoData.totalServicesCompleted || 0;

  const getAccessStatus = (service: PremiumService) => {
    const hasReputation = reputationScore >= service.reputationRequired;
    const hasVerification = service.exclusive ? isVerified : true;

    return {
      hasAccess: hasReputation && hasVerification,
      reason: !hasReputation
        ? `Requires ${service.reputationRequired}+ reputation score`
        : !hasVerification
        ? 'Requires verified customer status'
        : ''
    };
  };

  const unlockedServices = premiumServices.filter(service =>
    getAccessStatus(service).hasAccess
  );

  const lockedServices = premiumServices.filter(service =>
    !getAccessStatus(service).hasAccess
  );

  if (premiumServices.length === 0) return null;

  return (
    <div className="premium-services-section" style={{
      background: 'linear-gradient(135deg, #333333, #2a2a2a)',
      borderRadius: '16px',
      padding: '32px',
      margin: '32px 0',
      border: '2px solid #9d8cff',
      position: 'relative',
      boxShadow: '0 8px 32px rgba(157, 140, 255, 0.15)'
    }}>
      {/* Premium Badge */}
      <div style={{
        position: 'absolute',
        top: '-12px',
        right: '24px',
        background: 'linear-gradient(135deg, #9d8cff, #7c3aed)',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '0 0 16px 16px',
        fontSize: '14px',
        fontWeight: '700',
        boxShadow: '0 4px 12px rgba(157, 140, 255, 0.4)',
        zIndex: 2
      }}>
        PREMIUM SERVICES
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
        paddingTop: '8px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #9d8cff, #7c3aed)',
          borderRadius: '12px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 4px 12px rgba(157, 140, 255, 0.3)'
        }}>
          👑
        </div>
        <div>
          <h3 style={{
            margin: '0',
            color: '#f5f5f5',
            fontSize: '24px',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            Premium {serviceName} Services
          </h3>
          <p style={{
            margin: '6px 0 0 0',
            color: '#a1a1aa',
            fontSize: '16px',
            lineHeight: '1.4'
          }}>
            Exclusive high-end services for verified & high-reputation customers
          </p>
        </div>
      </div>

      {/* Unlocked Premium Services */}
      {unlockedServices.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
          <h4 style={{
            color: '#4fd1c5',
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Available Premium Services ({unlockedServices.length})
          </h4>
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {unlockedServices.map((service, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(135deg, #333333, #2a2a2a)',
                  border: '2px solid #4fd1c5',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(79, 209, 197, 0.15)',
                  cursor: onSelectService ? 'pointer' : 'default',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onClick={() => onSelectService?.(service.name)}
                onMouseEnter={(e) => {
                  if (onSelectService) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 209, 197, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onSelectService) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 209, 197, 0.15)';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                                            <h5 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        margin: '0',
                        color: '#f5f5f5'
                      }}>
                        {service.name}
                      </h5>
                      {service.exclusive && (
                        <span style={{
                          background: 'linear-gradient(135deg, #9d8cff, #7c3aed)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          EXCLUSIVE
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: '#a1a1aa',
                      margin: '0',
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      {service.description}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#4fd1c5'
                    }}>
                      {service.price}
                    </span>
                    <span style={{
                      color: '#4fd1c5',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'rgba(79, 209, 197, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      ✓ Unlocked
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Premium Services */}
      {lockedServices.length > 0 && (
        <div>
                    <h4 style={{
            color: '#ef4444',
            fontSize: '18px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            Locked Premium Services ({lockedServices.length})
          </h4>
          <div style={{
            display: 'grid',
            gap: '16px'
          }}>
            {lockedServices.map((service, index) => {
              const accessStatus = getAccessStatus(service);
              return (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)',
                    border: '2px solid #ef4444',
                    borderRadius: '12px',
                    padding: '20px',
                    opacity: '0.8',
                    cursor: 'not-allowed',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '8px'
                      }}>
                        <h5 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          margin: '0',
                          color: '#f5f5f5'
                        }}>
                          {service.name}
                        </h5>
                        {service.exclusive && (
                          <span style={{
                            background: '#52525b',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          EXCLUSIVE
                        </span>
                      )}
                    </div>
                    <p style={{
                      color: '#a1a1aa',
                      margin: '0 0 12px 0',
                      fontSize: '15px',
                      lineHeight: '1.5'
                    }}>
                      {service.description}
                    </p>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: '#fca5a5',
                      fontWeight: '600'
                    }}>
                      {accessStatus.reason}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#4fd1c5'
                    }}>
                      {service.price}
                    </span>
                    <span style={{
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: '600',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      Locked
                    </span>
                  </div>
                                 </div>
               </div>
             );
             })}
           </div>
        </div>
      )}

      {/* Progress Hint */}
      {lockedServices.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #333333, #2a2a2a)',
          border: '2px solid #9d8cff',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #9d8cff, #7c3aed)',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0
          }}>💡</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#f5f5f5',
              marginBottom: '8px'
            }}>
              How to Unlock Premium Services
            </div>
            <div style={{
              fontSize: '15px',
              color: '#a1a1aa',
              lineHeight: '1.5',
              marginBottom: '12px'
            }}>
              Complete more services and maintain high ratings to unlock exclusive premium offerings.
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'rgba(79, 209, 197, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4fd1c5'
              }}>
                Current Reputation: {reputationScore}/100
              </div>
              {!isVerified && (
                <div style={{
                  background: 'rgba(157, 140, 255, 0.1)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#9d8cff'
                }}>
                  Verification Required for Exclusive Services
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumServices;