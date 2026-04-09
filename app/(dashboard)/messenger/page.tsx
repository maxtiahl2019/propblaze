'use client';

import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'agency' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      name: 'Win-Win Solution',
      lastMessage: 'Your property has been accepted...',
      timestamp: '2h ago',
      unreadCount: 1,
      messages: [
        {
          id: 'm1',
          sender: 'agency',
          senderName: 'Win-Win Solution',
          text: 'Hello! We received your property listing for Knez Mihailova 24. Very interesting property! We have several qualified buyers interested in central Belgrade apartments. Could you provide more details?',
          timestamp: '10:15 AM'
        },
        {
          id: 'm2',
          sender: 'user',
          senderName: 'You',
          text: 'Hi Win-Win team! Thank you for your interest. Happy to answer any questions. The apartment was fully renovated in 2022.',
          timestamp: '10:32 AM'
        },
        {
          id: 'm3',
          sender: 'agency',
          senderName: 'Win-Win Solution',
          text: "That's great! Could you also share the exact floor plan? And are there any parking spaces included?",
          timestamp: '10:45 AM'
        },
        {
          id: 'm4',
          sender: 'user',
          senderName: 'You',
          text: 'I\'ll upload the floor plan to the documents vault. Regarding parking — there is one underground parking space included in the price.',
          timestamp: '11:02 AM'
        },
        {
          id: 'm5',
          sender: 'agency',
          senderName: 'Win-Win Solution',
          text: 'Perfect! We have a buyer who is very interested and would like to arrange a viewing next week. What times work for you?',
          timestamp: '11:18 AM'
        }
      ]
    },
    {
      id: 'conv-2',
      name: 'PropBlaze Support',
      lastMessage: 'Welcome to PropBlaze!',
      timestamp: '1d ago',
      unreadCount: 0,
      messages: [
        {
          id: 'm6',
          sender: 'bot',
          senderName: 'PropBlaze Bot',
          text: 'Welcome to PropBlaze! 🚀 Your account is set up and ready. Your property listing has been sent to 10 agencies. You can track all communication here.',
          timestamp: '9:00 AM'
        }
      ]
    }
  ]);

  const [activeConvId, setActiveConvId] = useState('conv-1');
  const [newMessage, setNewMessage] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConv) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConvId) {
        const newMsg: Message = {
          id: `m${Date.now()}`,
          sender: 'user',
          senderName: 'You',
          text: newMessage,
          timestamp: 'Just now'
        };

        const updated = {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
          timestamp: 'Just now',
          unreadCount: 0
        };

        // Auto-reply from agency after 3 seconds
        setTimeout(() => {
          setConversations(prev => prev.map(c => {
            if (c.id === activeConvId) {
              return {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `m${Date.now()}-reply`,
                    sender: 'agency',
                    senderName: 'Win-Win Solution',
                    text: 'Thank you! We\'ll confirm the appointment shortly.',
                    timestamp: 'Just now'
                  }
                ]
              };
            }
            return c;
          }));
        }, 3000);

        return updated;
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* Left panel: Conversation list */}
      <div style={{
        width: 280,
        minWidth: 280,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            💬 Messages
          </h2>
        </div>

        {/* Conversation list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
        }}>
          {conversations.map(conv => {
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  border: isActive ? `1px solid var(--primary-border)` : '1px solid transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  marginBottom: 4,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    margin: 0,
                  }}>
                    {conv.name}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span style={{
                      background: 'var(--primary)',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  margin: '0 0 4px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {conv.lastMessage}
                </p>
                <p style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-tertiary)',
                  margin: 0,
                }}>
                  {conv.timestamp}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel: Active conversation */}
      {activeConv && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg)',
          overflow: 'hidden',
        }}>
          {/* Conversation header */}
          <div style={{
            padding: '20px 32px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text)',
                margin: 0,
              }}>
                {activeConv.name}
              </h2>
            </div>
            {activeConvId === 'conv-1' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: 'var(--primary-light)',
                borderRadius: 6,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--primary)',
              }}>
                📎 Re: Apartment, Knez Mihailova 24
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}>
            {activeConv.messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '60%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  {msg.sender !== 'user' && (
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      margin: 0,
                    }}>
                      {msg.senderName}
                    </p>
                  )}
                  <div style={{
                    padding: '12px 16px',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--surface)',
                    color: msg.sender === 'user' ? 'white' : 'var(--text)',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                  }}>
                    {msg.text}
                  </div>
                  <p style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                  }}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div style={{
            padding: '20px 32px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
          }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: '12px 14px',
                fontSize: '0.875rem',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg)',
                color: 'var(--text)',
                fontFamily: 'inherit',
              }}
            />
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}>
              <button style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              >
                📎
              </button>
              <button style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
              >
                😊
              </button>
              <button
                onClick={handleSendMessage}
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
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
