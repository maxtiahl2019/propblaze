'use client';

import React, { useState } from 'react';

interface UploadedFile {
  name: string;
  uploadedAt: string;
}

interface DocumentState {
  [key: string]: UploadedFile | null;
}

export default function DocumentsPage() {
  const [ownershipDocs, setOwnershipDocs] = useState<DocumentState>({
    'title_deed': { name: 'title_deed_belgrade_apt.pdf', uploadedAt: '2 days ago' },
    'floor_plan': null,
    'building_permit': null,
    'energy_cert': null,
  });

  const [identityDocs, setIdentityDocs] = useState<DocumentState>({
    'passport': { name: 'passport_redacted.pdf', uploadedAt: '2 days ago' },
    'proof_address': null,
  });

  const [agreementData, setAgreementData] = useState({
    fullName: 'Aleksandar Petrović',
    passportId: 'PA123456',
    address: 'Knez Mihailova 24, Belgrade, Serbia',
    email: 'alex.petrovic@email.com',
    phone: '+381 63 123 4567',
    propertyAddress: 'Knez Mihailova 24, Belgrade, RS',
    propertyType: 'Apartment',
    listedPrice: '€340,000',
    commissionRate: '3%',
    duration: '90 days',
  });

  const [showToast, setShowToast] = useState(false);

  const docCategories = [
    { key: 'title_deed', label: 'Title Deed / Ownership Certificate', required: true },
    { key: 'floor_plan', label: 'Property Floor Plan', required: false },
    { key: 'building_permit', label: 'Building Permit', required: false },
    { key: 'energy_cert', label: 'Energy Certificate', required: false },
  ];

  const idCategories = [
    { key: 'passport', label: 'Passport / National ID', required: true },
    { key: 'proof_address', label: 'Proof of Address', required: false },
  ];

  const handleDocumentUpload = (docKey: string, section: 'ownership' | 'identity') => {
    const mockFileName = `document_${Date.now()}.pdf`;
    if (section === 'ownership') {
      setOwnershipDocs(prev => ({
        ...prev,
        [docKey]: { name: mockFileName, uploadedAt: 'Just now' }
      }));
    } else {
      setIdentityDocs(prev => ({
        ...prev,
        [docKey]: { name: mockFileName, uploadedAt: 'Just now' }
      }));
    }
  };

  const handleDocumentRemove = (docKey: string, section: 'ownership' | 'identity') => {
    if (section === 'ownership') {
      setOwnershipDocs(prev => ({ ...prev, [docKey]: null }));
    } else {
      setIdentityDocs(prev => ({ ...prev, [docKey]: null }));
    }
  };

  const handleGenerateAgreement = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleAgreementChange = (field: string, value: string) => {
    setAgreementData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ padding: '32px', background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Toast notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          background: 'var(--green)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'var(--shadow-md)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out',
        }}>
          ✓ Agreement generated and saved to your vault
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 8,
        }}>
          📁 Document Vault
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Upload and store your ownership documents securely. These will be used for commission agreements.
        </p>
      </div>

      {/* Main sections container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Section A: Ownership Documents */}
        <div>
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
              Ownership Documents
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {docCategories.map(cat => (
                <div key={cat.key}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    gap: 4,
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                    }}>
                      {cat.label}
                    </label>
                    {cat.required && (
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>*</span>
                    )}
                  </div>

                  {ownershipDocs[cat.key] ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'var(--green-light)',
                      border: `1px solid var(--green)`,
                      borderRadius: 8,
                      gap: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--green)', fontSize: '1.25rem' }}>✓</span>
                        <div>
                          <p style={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'var(--text)',
                            margin: 0,
                          }}>
                            {ownershipDocs[cat.key]?.name}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            margin: '2px 0 0 0',
                          }}>
                            Uploaded {ownershipDocs[cat.key]?.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDocumentRemove(cat.key, 'ownership')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-tertiary)',
                          fontSize: '0.875rem',
                          padding: 4,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDocumentUpload(cat.key, 'ownership')}
                      style={{
                        width: '100%',
                        padding: '24px',
                        border: `2px dashed var(--border)`,
                        borderRadius: 8,
                        background: 'var(--surface-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text)',
                        margin: 0,
                      }}>
                        Click to upload or drag & drop
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        margin: 0,
                      }}>
                        PDF, JPG, PNG
                      </p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section B: Personal Identity Documents */}
        <div>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
              }}>
                🔒 Personal Identity Documents
              </h2>
            </div>

            <p style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              marginBottom: 20,
              padding: '12px 12px',
              background: 'var(--primary-light)',
              borderRadius: 8,
              borderLeft: `3px solid var(--primary)`,
              margin: '0 0 20px 0',
            }}>
              <strong>🔐 Encrypted & Private:</strong> These documents are ONLY shared with agencies after you sign the commission agreement.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {idCategories.map(cat => (
                <div key={cat.key}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    gap: 4,
                  }}>
                    <label style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                    }}>
                      {cat.label}
                    </label>
                    {cat.required && (
                      <span style={{ color: 'var(--red)', fontWeight: 700 }}>*</span>
                    )}
                  </div>

                  {identityDocs[cat.key] ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'var(--green-light)',
                      border: `1px solid var(--green)`,
                      borderRadius: 8,
                      gap: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: 'var(--green)', fontSize: '1.25rem' }}>✓</span>
                        <div>
                          <p style={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: 'var(--text)',
                            margin: 0,
                          }}>
                            {identityDocs[cat.key]?.name}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            margin: '2px 0 0 0',
                          }}>
                            Uploaded {identityDocs[cat.key]?.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDocumentRemove(cat.key, 'identity')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-tertiary)',
                          fontSize: '0.875rem',
                          padding: 4,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDocumentUpload(cat.key, 'identity')}
                      style={{
                        width: '100%',
                        padding: '24px',
                        border: `2px dashed var(--border)`,
                        borderRadius: 8,
                        background: 'var(--surface-2)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--primary-light)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>📋</span>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text)',
                        margin: 0,
                      }}>
                        Click to upload or drag & drop
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        margin: 0,
                      }}>
                        PDF, JPG, PNG
                      </p>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Commission Agreement Data */}
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
          marginBottom: 24,
        }}>
          Commission Agreement — Auto-filled from your documents
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginBottom: 24,
        }}>
          {/* Personal Information */}
          <div>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-tertiary)',
            }}>
              Personal Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['fullName', 'passportId', 'address', 'email', 'phone'].map(field => (
                <div key={field}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {field === 'fullName' ? 'Owner Full Name' :
                     field === 'passportId' ? 'Passport/ID Number' :
                     field === 'address' ? 'Address' :
                     field === 'email' ? 'Email' :
                     'Phone'}
                  </label>
                  <input
                    type="text"
                    value={agreementData[field as keyof typeof agreementData]}
                    onChange={e => handleAgreementChange(field, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Property Information */}
          <div>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-tertiary)',
            }}>
              Property & Agreement
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['propertyAddress', 'propertyType', 'listedPrice', 'commissionRate', 'duration'].map(field => (
                <div key={field}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {field === 'propertyAddress' ? 'Property Address' :
                     field === 'propertyType' ? 'Property Type' :
                     field === 'listedPrice' ? 'Listed Price' :
                     field === 'commissionRate' ? 'Commission Rate' :
                     'Agreement Duration'}
                  </label>
                  <input
                    type="text"
                    value={agreementData[field as keyof typeof agreementData]}
                    onChange={e => handleAgreementChange(field, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      fontSize: '0.875rem',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      color: 'var(--text)',
                      fontFamily: 'inherit',
                    }}
                  />
                  {field === 'commissionRate' && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      marginTop: 4,
                      margin: '4px 0 0 0',
                    }}>
                      Standard platform rate
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons and status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.875rem',
            color: 'var(--green)',
            fontWeight: 500,
          }}>
            <span>✓</span>
            Agreement sent to Win-Win Solution agency
          </div>
          <button
            onClick={handleGenerateAgreement}
            style={{
              padding: '10px 16px',
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
            📄 Generate Commission Agreement PDF
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
