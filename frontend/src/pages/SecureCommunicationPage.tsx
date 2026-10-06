import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ShieldCheck, Lock, User, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';
import { MissingCase, SecureMessage } from '../types';
import { PrivacyNotice } from '../components/common/PrivacyNotice';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const SecureCommunicationPage: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<MissingCase | null>(null);
  const [messages, setMessages] = useState<SecureMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [redactionNotice, setRedactionNotice] = useState(false);

  useEffect(() => {
    apiClient.get('/cases').then((res) => {
      if (res.data.success && res.data.cases.length > 0) {
        setCases(res.data.cases);
        setSelectedCase(res.data.cases[0]);
        loadMessages(res.data.cases[0].caseId);
      }
      setIsLoading(false);
    });
  }, []);

  const loadMessages = async (caseId: string) => {
    try {
      const res = await apiClient.get(`/cases/${caseId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSelectCase = (caseItem: MissingCase) => {
    setSelectedCase(caseItem);
    loadMessages(caseItem.caseId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCase) return;

    setIsSending(true);
    setRedactionNotice(false);

    try {
      const res = await apiClient.post('/messages', {
        caseId: selectedCase.caseId,
        message: newMessage,
        visibility: 'family_and_investigator',
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.messageDoc]);
        setNewMessage('');
        if (res.data.hadRedactions) {
          setRedactionNotice(true);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} className="py-8" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Controlled Case Communication Terminal
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Mediated channel between families, investigators, and verified agencies. Direct phone numbers are withheld.
        </p>
      </div>

      <PrivacyNotice message="To prevent unauthorized exposure, external telephone numbers and email addresses are automatically stripped by the SETHU privacy gateway." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Select Active Case Channel
          </h3>
          {cases.map((c) => {
            const isSelected = selectedCase?.caseId === c.caseId;
            return (
              <div
                key={c.caseId}
                onClick={() => handleSelectCase(c)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  isSelected
                    ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-500 ring-2 ring-teal-400/20 shadow-md'
                    : 'bg-white dark:bg-sethu-navy-900 border-slate-200 dark:border-sethu-navy-800 hover:border-teal-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="font-mono text-teal-700 dark:text-teal-300">{c.caseId}</span>
                  <span className="text-[10px] text-slate-500">{c.status}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.personName}</h4>
                <p className="text-[11px] text-slate-500 truncate">Area: {c.approximateLocation}</p>
              </div>
            );
          })}
        </div>

        {/* Message Thread Console */}
        {selectedCase && (
          <div className="lg:col-span-2 bg-white dark:bg-sethu-navy-900 border border-slate-200 dark:border-sethu-navy-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-sethu-navy-800">
              <div>
                <span className="text-xs font-mono font-bold text-teal-600">
                  {selectedCase.caseId} — Case Dispatch
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedCase.personName} Investigation Channel
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                End-to-End Encrypted
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2">
              {messages.length > 0 ? (
                messages.map((m) => {
                  const isMe = m.senderId?._id === user?.id;
                  return (
                    <div
                      key={m._id}
                      className={`p-3.5 rounded-2xl max-w-md text-xs space-y-1.5 shadow-sm ${
                        isMe
                          ? 'ml-auto bg-teal-600 text-white rounded-tr-none'
                          : 'mr-auto bg-slate-100 dark:bg-sethu-navy-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-sethu-navy-750'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 pb-1 border-b border-white/10 dark:border-slate-700">
                        <span className="font-bold">{m.senderId?.name || 'Authorized Official'} ({m.senderId?.role?.replace('_', ' ') || 'User'})</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{m.message}</p>
                      {m.hasRedactedContactInfo && (
                        <span className="text-[10px] text-amber-200 block italic pt-0.5">
                          [Direct personal phone numbers withheld per SETHU privacy protocol]
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  No messages yet. Send an investigative update or note to begin mediated coordination.
                </div>
              )}
            </div>

            {redactionNotice && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Notice: Direct phone numbers or email addresses in your previous message were masked by the privacy filter.</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 dark:border-sethu-navy-800 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to authorized case members..."
                className="flex-1 text-xs p-3 rounded-xl border border-slate-200 dark:border-sethu-navy-750 bg-slate-50 dark:bg-sethu-navy-850 focus:ring-2 focus:ring-teal-500 outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-5 py-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
