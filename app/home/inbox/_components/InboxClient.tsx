"use client";

import React, { useState } from 'react';

// Dummy data for simulation (now empty as requested)
const DUMMY_CONTACTS: any[] = [];

interface InboxClientProps {
    role: 'donor' | 'organization';
}

const InboxClient = ({ role }: InboxClientProps) => {
    const [selectedId, setSelectedId] = useState(DUMMY_CONTACTS[0]?.id || null);

    const isOrg = role === 'organization';
    const accentColor = isOrg ? 'bg-[#FF9248]' : 'bg-blue-600';
    const accentText = isOrg ? 'text-[#FF9248]' : 'text-blue-700';
    const accentBg = isOrg ? 'bg-[#FFF5ED]' : 'bg-[#EEF2FF]';
    const accentRing = isOrg ? 'ring-[#FF9248]/10' : 'ring-blue-600/10';
    const accentShadow = isOrg ? 'shadow-[#FF9248]/20' : 'shadow-blue-200';

    const selectedContact = DUMMY_CONTACTS.find(c => c.id === selectedId);

    return (
        <div className="flex-1 flex overflow-hidden bg-[#F8F9FB] font-['Inter']">
            {/* LEFT: Contact Stack */}
            <div className="w-[380px] border-r border-slate-200 flex flex-col bg-white">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
                        <button className={`p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full bg-slate-100 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-slate-200 transition-all outline-none"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {DUMMY_CONTACTS.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedId(contact.id)}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex gap-4 group hover:shadow-md ${selectedId === contact.id ? `${accentBg} shadow-sm` : 'hover:bg-slate-50'}`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                                {contact.avatar}
                            </div>
                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start mb-0.5">
                                    <h3 className={`font-bold truncate ${selectedId === contact.id ? accentText : 'text-slate-900'}`}>{contact.name}</h3>
                                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{contact.time}</span>
                                </div>
                                <p className={`text-sm truncate ${contact.unread > 0 ? 'text-slate-900 font-semibold' : 'text-slate-500 font-light'}`}>
                                    {contact.lastMessage}
                                </p>
                            </div>
                            {contact.unread > 0 && (
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full ${accentColor} text-white text-[10px] flex items-center justify-center font-bold ring-4 ${accentRing}`}>
                                        {contact.unread}
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT: Conversation View */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedContact ? (
                    <>
                        {/* Header */}
                        <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                                    {selectedContact.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-none">{selectedContact.name}</h3>
                                    <span className="text-xs text-green-500 font-medium flex items-center gap-1 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors text-slate-500">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                <button className="p-2.5 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors text-slate-500">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FBFCFE]">
                            <div className="flex justify-center">
                                <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-400 uppercase tracking-widest shadow-sm">Today</span>
                            </div>

                            {/* Message Bubble - Left */}
                            <div className="flex gap-4 max-w-[80%]">
                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-sm">
                                    {selectedContact.avatar}
                                </div>
                                <div className="space-y-1">
                                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-slate-800 leading-relaxed">
                                        Hello! We just wanted to confirm that your donation packages have been successfully sorted. Would you like a tax receipt?
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold ml-1">10:45 AM</span>
                                </div>
                            </div>

                            {/* Message Bubble - Right (User) */}
                            <div className="flex flex-row-reverse gap-4 max-w-[80%] ml-auto text-right">
                                <div className={`w-8 h-8 rounded-lg ${accentColor} flex-shrink-0 flex items-center justify-center text-white text-sm shadow-sm`}>
                                    👤
                                </div>
                                <div className="space-y-1">
                                    <div className={`${accentColor} p-4 rounded-2xl rounded-tr-none shadow-lg ${accentShadow} text-white leading-relaxed text-left`}>
                                        Yes, please! That would be very helpful. Thank you for the update.
                                    </div>
                                    <div className="flex items-center justify-end gap-1 font-bold text-[10px] text-slate-400 mr-1">
                                        10:48 AM
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isOrg ? "#FF9248" : "#2563eb"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-white border-t border-slate-100">
                            <div className="bg-slate-50 rounded-2xl p-2 flex items-end gap-2 border border-slate-100 focus-within:ring-2 focus-within:ring-slate-200 transition-all">
                                <button className="p-3 hover:bg-white rounded-xl text-slate-400 transition-colors">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </button>
                                <textarea
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent border-none outline-none py-3 resize-none text-sm max-h-32 min-h-[44px]"
                                    rows={1}
                                />
                                <button className={`p-3 ${accentColor} text-white rounded-xl hover:opacity-90 transition-all shadow-lg ${accentShadow}`}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
                            📬
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Your Inbox</h3>
                        <p className="max-w-xs text-slate-500 font-light">Select a conversation from the left to start chatting with donors or organizations.</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
            `}</style>
        </div>
    );
};

export default InboxClient;
