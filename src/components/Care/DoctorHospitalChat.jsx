/**
 * DoctorHospitalChat.jsx — Real-time cross-tab chat between family doctor & hospital.
 *
 * Features:
 *  • Scrollable message thread (role-based alignment: doctor=right, hospital=left)
 *  • Text input + send on Enter/button
 *  • 📞 Call button → realistic mock calling overlay
 *  • BroadcastChannel sync via chatStore (instant cross-tab)
 *  • Auto-reply simulation for demo purposes
 *
 * Usage:
 *   <DoctorHospitalChat
 *     alertId="alert-123"
 *     myRole="hospital"           // 'doctor' | 'hospital'
 *     myName="Ruby Hall Clinic"
 *     otherName="Dr. Arjun Mehta"
 *     isDark={false}
 *     onClose={() => setShowChat(false)}
 *   />
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, PhoneOff, MessageCircle, PhoneCall } from 'lucide-react';
import chatService, { subscribeChat, getMessages, sendCallEvent } from '../../services/chatService';
import { chatStore } from '../../services/syncService';

// ── Call States ───────────────────────────────────────────────────────────────
const CALL_IDLE       = 'idle';
const CALL_RINGING    = 'ringing';
const CALL_CONNECTED  = 'connected';

const DoctorHospitalChat = ({
  alertId,
  myRole   = 'hospital',    // 'hospital' | 'doctor'
  myName   = 'Hospital',
  otherName = 'Doctor',
  isDark = false,
  onClose,
}) => {
  const [messages,  setMessages]  = useState(() => getMessages(alertId));
  const [input,     setInput]     = useState('');
  const [callState, setCallState] = useState(CALL_IDLE);
  const [callTimer, setCallTimer] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Subscribe to chat store ───────────────────────────────────────────────
  useEffect(() => {
    const unsub = chatStore.subscribe((all) => {
      const mine = (all || []).filter(m => m.alertId === alertId);
      setMessages(mine);
    });
    return unsub;
  }, [alertId]);

  // ── Auto-scroll to bottom on new messages ──────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    chatService.sendMessage(myName, myRole, text, alertId);
    setInput('');

    // Auto-reply from the other side (for demo)
    if (myRole === 'hospital') {
      chatService.simulateDoctorReply(alertId, otherName);
    } else {
      chatService.simulateHospitalReply(alertId, otherName);
    }
  };

  // ── Call flow ─────────────────────────────────────────────────────────────
  const startCall = () => {
    setCallState(CALL_RINGING);
    sendCallEvent('call_start', myName, myRole, alertId);

    // Simulate answer after 3 seconds
    const t = setTimeout(() => {
      setCallState(CALL_CONNECTED);
      sendCallEvent('call_connected', myName, myRole, alertId);
    }, 3000);
    setCallTimer(t);
  };

  const endCall = () => {
    if (callTimer) clearTimeout(callTimer);
    setCallState(CALL_IDLE);
    sendCallEvent('call_ended', myName, myRole, alertId);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const bg     = isDark ? 'bg-slate-900' : 'bg-white';
  const header = isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100';
  const footer = isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100';
  const inputCls = isDark
    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400';

  // ── Render: Call overlay ──────────────────────────────────────────────────
  const CallOverlay = () => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)' }}>

      {/* Avatar ring */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl border-4 border-white/30">
          {myRole === 'hospital' ? '🏥' : '👨‍⚕️'}
        </div>
        {callState === CALL_RINGING && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
            <div className="absolute -inset-3 rounded-full border-2 border-white/20 animate-ping" style={{ animationDelay: '0.3s' }} />
          </>
        )}
        {callState === CALL_CONNECTED && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
            <span className="text-xs">✓</span>
          </div>
        )}
      </div>

      <p className="text-white font-black text-xl mb-1">{otherName}</p>
      <p className="text-blue-200 text-sm mb-8">
        {callState === CALL_RINGING ? 'Calling...' : '● Connected'}
      </p>

      {/* Action buttons */}
      <div className="flex gap-8">
        <button
          onClick={endCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-xl shadow-red-500/40 active:scale-95 transition-all"
        >
          <PhoneOff className="w-7 h-7 text-white" />
        </button>
      </div>

      <p className="text-blue-200/60 text-[10px] mt-8">
        {callState === CALL_CONNECTED ? 'Secure channel • Encrypted' : 'PulseAID Secure Call'}
      </p>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-end sm:items-center justify-center`}
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className={`${bg} relative w-full max-w-sm sm:max-w-md mx-4 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in`}
        style={{ height: '75vh', maxHeight: 580 }}
      >
        {/* Header */}
        <div className={`${header} border-b px-4 py-3 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg">
              {myRole === 'hospital' ? '👨‍⚕️' : '🏥'}
            </div>
            <div>
              <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-800'}`}>{otherName}</p>
              <p className={`text-[10px] font-semibold ${isDark ? 'text-green-400' : 'text-green-600'} flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                Online · Emergency Channel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startCall}
              disabled={callState !== CALL_IDLE}
              className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-all active:scale-95 disabled:opacity-40"
              title="Start call"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
                💬
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Start emergency consultation</p>
              <p className={`text-[11px] ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>Messages sync instantly across all devices</p>
            </div>
          )}

          {messages.map(msg => {
            const isMe = msg.role === myRole;

            // System events
            if (msg.type === 'call_start') {
              return (
                <div key={msg.id} className="flex items-center justify-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-green-500" />
                  <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {msg.from} started a call
                  </span>
                </div>
              );
            }
            if (msg.type === 'call_connected') {
              return (
                <div key={msg.id} className="flex items-center justify-center gap-2">
                  <span className="text-green-500 text-xs">●</span>
                  <span className={`text-[11px] font-semibold text-green-600`}>Call connected</span>
                </div>
              );
            }
            if (msg.type === 'call_ended') {
              return (
                <div key={msg.id} className="flex items-center justify-center gap-2">
                  <PhoneOff className="w-3 h-3 text-red-400" />
                  <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    Call ended
                  </span>
                </div>
              );
            }

            // Regular messages
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] ${isMe ? 'order-2' : ''}`}>
                  {!isMe && (
                    <p className={`text-[10px] font-bold mb-1 ml-1 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                      {msg.from}
                    </p>
                  )}
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : isDark
                        ? 'bg-slate-700 text-slate-100 rounded-bl-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[9px] mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'} ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input footer */}
        <div className={`${footer} border-t px-3 py-3 flex items-end gap-2 shrink-0`}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message ${otherName}...`}
            className={`flex-1 text-sm px-4 py-2.5 rounded-2xl border outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${inputCls}`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Call overlay (on top of everything) */}
        {callState !== CALL_IDLE && <CallOverlay />}
      </div>
    </div>
  );
};

export default DoctorHospitalChat;
