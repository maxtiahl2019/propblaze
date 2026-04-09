'use client';

import React, { useState } from 'react';

interface OfferState {
  status: 'new' | 'accepted' | 'active';
}

export default function AgencyPortalPage() {
  const [offer, setOffer] = useState<OfferState>({ status: 'new' });
  const [showModal, setShowModal] = useState(false);
  const [showAgreementSigned, setShowAgreementSigned] = useState(false);

  const handleAcceptOffer = () => {
    setShowModal(true);
    setTimeout(() => {
      setOffer({ status: 'accepted' });
      setShowModal(false);
    }, 2000);
  };

  const handleSignAgreement = () => {
    setShowAgreementSigned(true);
  };

  const progressStages = [
    { label: 'Received', completed: true },
    { label: 'Accepted', completed: offer.status !== 'new' },
    { label: 'Active Marketing', completed: offer.status !== 'new' },
    { label: 'Offer Received', completed: false },
    { label: 'Under Contract', completed: false },
    { label: 'Sold', completed: false },
  ];

  const actionItems = [
    { text: 'Review property documents', completed: true },
    { text: 'Sign commission agreement', completed: showAgreementSigned },
    { text: 'Schedule property visit', completed: false },
    { text: 'List on local portals', completed: false },
    { text: 'Contact buyer network', completed: false },
  ];

  return (
    <div style={{ padding: '32px', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 12,
            padding: 32,
            maxWidth: 400,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>✓</div>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 12,
            }}>
              You've accepted this property!
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: 8,
            }}>
              The owner has been notified. Commission agreement will be prepared.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
          }}>
            Win-Win Solution — Agency Portal
          </h1>
          <span style={{
            background: 'var(--primary)',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 999,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Agency
          </span>
        </div>

        {/* Notification banner */}
        {offer.status === 'new' && (
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), #EA580C)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>📬</span>
            You have 1 new property offer
          </div>
        )}
      </div>

      {offer.status === 'new' ? (
        /* Active Offer Card */
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 32,
          marginBottom: 32,
          boxShadow: 'var(--shadow-md)',
        }}>
          {/* Property header */}
          <div style({
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
          })>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 8px 0',
              }}>
                Apartment — Knez Mihailova 24, Belgrade, Serbia
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
              }}>
                <span>💶 €340,000</span>
                <span>📏 95m²</span>
                <span>🛏️ 3 bedrooms</span>
              </div>
            </div>

            {/* Match score */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}>
                96
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                textAlign: 'center',
              }}>
                Match Score
              </div>
              <div style={{
                width: 100,
                height: 6,
                background: 'var(--surface-2)',
                borderRadius: 999,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: '96%',
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), #EA580C)',
                }}></div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div style={{
            padding: '16px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            marginBottom: 24,
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}>
            Received: <strong>2 hours ago via PropBlaze AI</strong>
          </div>

          {/* AI Description */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 12,
            }}>
              Property Description
            </h3>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: '0 0 12px 0',
            }}>
              Premium apartment in the heart of Belgrade's most prestigious street, Knez Mihailova. This fully renovated 95m² residence features high ceilings, natural light from large windows, and modern amenities throughout. Perfect for discerning buyers seeking central location and luxury.
            </p>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: '0 0 12px 0',
            }}>
              The apartment boasts three spacious bedrooms, newly renovated bathroom with heated floors, open-plan living area, and a dedicated office space. All original hardwood floors have been restored to their original beauty.
            </p>
            <p style={{
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              Located on a vibrant street with restaurants, cafes, and cultural attractions within walking distance. Excellent accessibility to public transport and business districts. Building is well-maintained with 24-hour security.
            </p>
          </div>

          {/* Key Features */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 12,
            }}>
              Key Features
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              {[
                '✓ High ceilings (3.2m)',
                '✓ Recently renovated (2022)',
                '✓ Hardwood floors',
                '✓ 24-hour security',
                '✓ Parking space included',
                '✓ Central Belgrade location'
              ].map((feature, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  background: 'var(--surface-2)',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  color: 'var(--text)',
                }}>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Owner info */}
          <div style={{
            padding: '16px',
            background: 'var(--primary-light)',
            borderRadius: 8,
            borderLeft: `3px solid var(--primary)`,
            marginBottom: 24,
            fontSize: '0.875rem',
            color: 'var(--text)',
          }}>
            <strong>Owner:</strong> A. Petrović — verified owner<br/>
            <strong>Documents:</strong> ✓ Title deed | ✓ Passport
          </div>

          {/* Commission info */}
          <div style={{
            padding: '16px',
            background: 'var(--surface-2)',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: '0.875rem',
          }}>
            <strong style={{ color: 'var(--text)' }}>Commission: 3% (€10,200 potential)</strong>
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            gap: 12,
          }}>
            <button
              onClick={handleAcceptOffer}
              style={{
                flex: 1,
                padding: '14px 24px',
                background: 'var(--green)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              ✅ Accept & Start Sale
            </button>
            <button
              style={{
                padding: '14px 24px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--red)';
                (e.currentTarget as HTMLElement).style.color = 'var(--red)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              ❌ Decline
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Status badge when accepted */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--green-light)',
            border: `1px solid var(--green)`,
            borderRadius: 8,
            marginBottom: 32,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--green)',
          }}>
            ✓ ACTIVE — In your portfolio
          </div>

          {/* Sales Pipeline */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
          }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 20,
            }}>
              Sales Pipeline
            </h2>

            {/* Progress tracker */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
              gap: 8,
            }}>
              {progressStages.map((stage, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: stage.completed ? 'var(--green)' : 'var(--surface-2)',
                    color: stage.completed ? 'white' : 'var(--text-tertiary)',
                    marginBottom: 8,
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    {stage.completed ? '✓' : i + 1}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    textAlign: 'center',
                    fontWeight: stage.label === 'Active Marketing' ? 600 : 400,
                    color: stage.label === 'Active Marketing' ? 'var(--primary)' : stage.completed ? 'var(--green)' : 'var(--text-tertiary)',
                  }}>
                    {stage.label}
                  </div>
                  {i < progressStages.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      left: '50%',
                      width: '100%',
                      height: 2,
                      background: stage.completed ? 'var(--green)' : 'var(--surface-2)',
                      zIndex: 1,
                    }}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Action items */}
            <div style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid var(--border)',
            }}>
              <h3 style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: 12,
              }}>
                Action Items
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {actionItems.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 0',
                    fontSize: '0.875rem',
                  }}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled
                      style={{
                        width: 18,
                        height: 18,
                        cursor: 'pointer',
                      }}
                    />
                    <label style={{
                      color: item.completed ? 'var(--text-tertiary)' : 'var(--text)',
                      textDecoration: item.completed ? 'line-through' : 'none',
                    }}>
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commission Agreement */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
          }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 20,
            }}>
              Commission Agreement
            </h2>

            {/* Agreement preview */}
            <div style={{
              padding: 16,
              background: 'var(--surface-2)',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
            }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Owner:</strong> A. Petrović
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Property:</strong> Knez Mihailova 24, Belgrade
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Commission Rate:</strong> 3%
              </p>
              <p style={{ margin: 0 }}>
                <strong>Duration:</strong> 90 days
              </p>
            </div>

            {/* Signature status or button */}
            {showAgreementSigned ? (
              <div style={{
                padding: 16,
                background: 'var(--green-light)',
                border: `1px solid var(--green)`,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--green)',
              }}>
                ✓ Agreement signed digitally
              </div>
            ) : (
              <div style={{
                padding: '24px',
                background: 'var(--surface-2)',
                borderRadius: 8,
                marginBottom: 16,
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                Digital signature area — Click "Sign Agreement" below
              </div>
            )}

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
            }}>
              {!showAgreementSigned && (
                <button
                  onClick={handleSignAgreement}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '0.9';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.opacity = '1';
                  }}
                >
                  Sign Agreement
                </button>
              )}
              <button
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: 'transparent',
                  color: 'var(--blue)',
                  border: `1px solid var(--blue)`,
                  borderRadius: 8,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--blue)';
                  (e.currentTarget as HTMLElement).style.color = 'white';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--blue)';
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
