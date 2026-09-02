import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sendPatientChatMessage } from '../../services/api';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  Bot,
  User,
  Heart,
  Pill,
  Clock,
  HelpCircle
} from 'lucide-react';

export default function PatientChatbot() {
  const { activePatient, activePatientId, isPatientLoggedIn } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(`smriti_chat_${activePatientId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `Hello ${activePatient?.name ? activePatient.name.split(' ')[0] : 'there'}! I am Smriti, your caring companion. You can ask me about your medicines, today's schedule, doctor, or family anytime. 🌸`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);
  const [wakeWordActive, setWakeWordActive] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const wakeWordRecognitionRef = useRef(null);

  // Sync messages to session storage for this patient
  useEffect(() => {
    if (activePatientId) {
      sessionStorage.setItem(`smriti_chat_${activePatientId}`, JSON.stringify(messages));
    }
  }, [messages, activePatientId]);

  // Reset chat when active patient changes or logs out
  useEffect(() => {
    if (!isPatientLoggedIn) {
      setMessages([]);
      setIsOpen(false);
      stopSpeaking();
    } else {
      const saved = sessionStorage.getItem(`smriti_chat_${activePatientId}`);
      if (!saved) {
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'assistant',
            text: `Hello ${activePatient?.name ? activePatient.name.split(' ')[0] : 'there'}! I am Smriti, your caring companion. You can ask me about your medicines, today's schedule, doctor, or family anytime. 🌸`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }
  }, [activePatientId, isPatientLoggedIn]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Speech Synthesis helper
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !autoSpeakEnabled) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[🌸❤️✅⏳💊🩺👦📅⚡]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Gentle slower pacing for seniors
    utterance.pitch = 1.05; // Warm, friendly pitch

    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.includes('en-US'));
    if (friendlyVoice) utterance.voice = friendlyVoice;

    utterance.onstart = () => setIsSpeakingAloud(true);
    utterance.onend = () => setIsSpeakingAloud(false);
    utterance.onerror = () => setIsSpeakingAloud(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingAloud(false);
  };

  // Web Speech Recognition for Dictation
  const startVoiceInput = () => {
    stopSpeaking();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = activePatient?.language === 'Assamese' ? 'en-IN' : 'en-IN';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setSpeechTranscript(transcript);
        setInputQuery(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (speechTranscript && speechTranscript.trim().length > 1) {
          handleSendMessage(speechTranscript.trim());
          setSpeechTranscript('');
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition warning:', err.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  // Background Wake Word Detection ("Hey Smriti" / "Smriti")
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || !isPatientLoggedIn || isListening) return;

    let wakeRecognition;
    try {
      wakeRecognition = new SpeechRecognition();
      wakeRecognition.continuous = true;
      wakeRecognition.interimResults = true;
      wakeRecognition.lang = 'en-IN';

      wakeRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript.toLowerCase();
          if (text.includes('hey smriti') || text.includes('smriti') || text.includes('hello smriti')) {
            setIsOpen(true);
            setWakeWordActive(true);
            stopSpeaking();
            setTimeout(() => {
              setWakeWordActive(false);
              startVoiceInput();
            }, 600);
            break;
          }
        }
      };

      wakeRecognition.onerror = () => {};
      wakeRecognition.onend = () => {
        // Restart wake listener if patient is logged in
        if (isPatientLoggedIn && !isListening) {
          try { wakeRecognition.start(); } catch (e) {}
        }
      };

      wakeWordRecognitionRef.current = wakeRecognition;
      try {
        wakeRecognition.start();
      } catch (e) {}
    } catch (e) {}

    return () => {
      if (wakeWordRecognitionRef.current) {
        try { wakeWordRecognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [isPatientLoggedIn, isListening]);

  // Send message to Gemini backend
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    stopSpeaking();
    setInputQuery('');
    setSpeechTranscript('');

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history payload from recent turns
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await sendPatientChatMessage(
        activePatient?.id || activePatientId || 'pat-1',
        query,
        historyPayload
      );

      const replyText = res.reply || `Hello ${activePatient?.name ? activePatient.name.split(' ')[0] : 'friend'}! I am right here with you. How else can I help you today? 🌸`;

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);

      // Speak AI response aloud
      if (autoSpeakEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      console.error('Chat send error:', err);
      setIsLoading(false);

      const errorBotMsg = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: `I am right here with you, ${activePatient?.name ? activePatient.name.split(' ')[0] : ''}. Take a calm breath. Your doctor ${activePatient?.primaryCaregiver || 'Dr. Ananya'} is taking great care of you. 🌸`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorBotMsg]);
      if (autoSpeakEnabled) {
        speakText(errorBotMsg.text);
      }
    }
  };

  const handleClearHistory = () => {
    stopSpeaking();
    const initial = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. I am ready to help you again, ${activePatient?.name ? activePatient.name.split(' ')[0] : ''}! 🌸`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    sessionStorage.removeItem(`smriti_chat_${activePatientId}`);
  };

  const quickPrompts = [
    { label: "What is my next medicine? 💊", query: "What is my next scheduled medicine and when should I take it?" },
    { label: "Who is my doctor? 🩺", query: "Who is my primary doctor and caregiver?" },
    { label: "Remind me about my family 🌸", query: "Can you remind me about my family members and memories?" },
    { label: "What routines are due today? 📅", query: "What are my daily routines scheduled for today?" },
    { label: "I am feeling a bit confused ❤️", query: "I am feeling a bit confused right now. Where am I and what should I do?" }
  ];

  // Don't render if patient is not logged in
  if (!isPatientLoggedIn) return null;

  return (
    <>
      {/* 1. FLOATING CIRCULAR CHAT BUTTON (FIXED BOTTOM-RIGHT) */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3">
        
        {/* Friendly Wake Pill Indicator */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 text-stone-800 text-xs sm:text-sm font-black shadow-lg border border-amber-800/30 backdrop-blur-xs cursor-pointer hover:border-amber-800 hover:scale-105 transition-all group animate-bounce duration-1000"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Say "Hey Smriti" or Tap</span>
            <span className="text-amber-800">🌸</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (isSpeakingAloud) stopSpeaking();
          }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer relative group ${
            isOpen 
              ? 'bg-stone-800 hover:bg-stone-900 rotate-90 scale-95' 
              : 'bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-800 hover:scale-110 active:scale-95 ring-4 ring-amber-800/20'
          }`}
          title="Open Smriti Assistant"
          aria-label="Open AI Chatbot"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="absolute -top-1 -right-1 text-xs">🌸</span>
            </div>
          )}

          {/* Active Speaking / Listening Wave Ring */}
          {(isSpeakingAloud || isListening) && !isOpen && (
            <span className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping" />
          )}
        </button>

      </div>

      {/* 2. CHAT WINDOW PANEL */}
      {isOpen && (
        <div className="fixed bottom-22 sm:bottom-28 right-4 sm:right-8 w-[calc(100vw-32px)] sm:w-[420px] max-w-lg h-[580px] max-h-[82vh] bg-white rounded-3xl sm:rounded-[32px] shadow-2xl border border-stone-200/90 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-xs">
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-xl shadow-2xs">
                  🌸
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-amber-900" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-base sm:text-lg tracking-tight">
                    Smriti Assistant
                  </h3>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    AI
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 font-medium">
                  {isListening 
                    ? '🎙️ Listening to you...' 
                    : (isSpeakingAloud ? '🔊 Speaking reply aloud...' : 'Always with you • Memory Companion')}
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1.5">
              
              {/* Voice Read-Aloud Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (isSpeakingAloud) stopSpeaking();
                  setAutoSpeakEnabled(!autoSpeakEnabled);
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  autoSpeakEnabled 
                    ? 'bg-white/20 text-amber-200 hover:bg-white/30' 
                    : 'bg-white/10 text-stone-400 hover:bg-white/20'
                }`}
                title={autoSpeakEnabled ? 'Voice read-aloud active (tap to mute)' : 'Voice read-aloud muted (tap to enable)'}
              >
                {autoSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Clear History */}
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close Window */}
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

          </div>

          {/* Active Speaking / Listening Banner */}
          {isListening && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-rose-900 animate-pulse shrink-0">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                <span>Listening to your voice... Speak now</span>
              </span>
              <button
                onClick={startVoiceInput}
                className="text-rose-700 underline font-black cursor-pointer"
              >
                Done / Cancel
              </button>
            </div>
          )}

          {isSpeakingAloud && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-bold text-amber-950 shrink-0">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-800 animate-bounce" />
                <span>Speaking reply aloud...</span>
              </span>
              <button
                onClick={stopSpeaking}
                className="text-amber-800 underline font-black cursor-pointer"
              >
                Stop Audio ⏹️
              </button>
            </div>
          )}

          {/* Message History Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-stone-50/50">
            
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
                    isUser 
                      ? 'bg-amber-800 text-white' 
                      : 'bg-amber-100 border border-amber-300 text-amber-900'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : '🌸'}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[82%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl text-sm sm:text-base leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-amber-800 text-white rounded-tr-xs font-medium'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-tl-xs font-medium'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Bottom Timestamp & Voice replay button for assistant */}
                    <div className={`flex items-center gap-2 text-[11px] text-stone-400 font-medium px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          className="hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                          title="Listen to this message again"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 shrink-0 flex items-center justify-center text-xs">
                  🌸
                </div>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 rounded-tl-xs shadow-2xs flex items-center gap-2 text-stone-500 text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-800 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-800 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-amber-800 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-1 text-xs text-stone-400">Thinking for you...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200/80 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.query)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-white hover:bg-amber-50 hover:border-amber-300 text-stone-700 hover:text-amber-900 border border-stone-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input & Action Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Input Button */}
              <button
                type="button"
                onClick={startVoiceInput}
                className={`p-3 rounded-2xl transition-all cursor-pointer shrink-0 shadow-xs ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/30'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95'
                }`}
                title={isListening ? 'Stop listening' : 'Tap to speak your question'}
                aria-label="Voice input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? "Listening to your voice..." : "Type or speak your question..."}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-stone-50 border border-stone-300 rounded-2xl text-sm sm:text-base font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white focus:ring-2 focus:ring-amber-800/10 transition-all shadow-inner"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className={`p-3 rounded-2xl text-white font-black transition-all shrink-0 cursor-pointer shadow-xs ${
                  inputQuery.trim() && !isLoading
                    ? 'bg-amber-800 hover:bg-amber-900 active:scale-95'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

          </div>

        </div>
      )}
    </>
  );
}
