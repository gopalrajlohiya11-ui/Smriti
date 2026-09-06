import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sendPatientChatMessage } from '../../services/api';
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  User, 
  Maximize2, 
  Minimize2, 
  AlertCircle, 
  Square, 
  Loader2,
  Sparkles,
  Pill,
  Stethoscope,
  Heart,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import FoxtailOrchidIcon from '../FoxtailOrchidIcon';

const LANGUAGE_CODE_MAP = {
  "hindi": "hi-IN",
  "english": "en-IN",
  "bengali": "bn-IN",
  "assamese": "as-IN",
  "manipuri": "en-IN",
  "khasi": "en-IN",
  "mizo": "en-IN"
};

export default function PatientChatbot() {
  const { activePatient, activePatientId, isPatientLoggedIn, currentLanguage } = useApp();

  const getPatientLangCode = () => {
    if (currentLanguage?.code) {
      if (currentLanguage.code === 'hi') return 'hi-IN';
      if (currentLanguage.code === 'as') return 'as-IN';
      if (currentLanguage.code === 'en') return 'en-IN';
    }
    const raw = (activePatient?.preferredLanguage || activePatient?.language || activePatient?.nativeLanguage || 'english').toLowerCase().trim();
    return LANGUAGE_CODE_MAP[raw] || 'en-IN';
  };

  const getPatientLangName = () => {
    return activePatient?.preferredLanguage || activePatient?.language || activePatient?.nativeLanguage || 'English';
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Chat message history initialized from sessionStorage
  const [messages, setMessages] = useState(() => {
    if (!activePatientId) return [];
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
        text: `Hello! I am Smriti, your caring companion. You can ask me about your medicines, today's schedule, doctor, or family anytime.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(true);
  const [isSpeakingAloud, setIsSpeakingAloud] = useState(false);
  const [micStatusMsg, setMicStatusMsg] = useState('');

  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isSendingRef = useRef(false);

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
      setIsFullScreen(false);
      stopSpeaking();
      stopVoiceRecording();
    } else {
      const saved = sessionStorage.getItem(`smriti_chat_${activePatientId}`);
      if (!saved) {
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: 'assistant',
            text: `Hello! I am Smriti, your caring companion. You can ask me about your medicines, today's schedule, doctor, or family anytime.`,
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
  }, [messages, isOpen, isLoading, isFullScreen]);

  // Speech Synthesis helper
  const speakText = (text, forcedLangCode = null) => {
    if (!('speechSynthesis' in window) || !autoSpeakEnabled) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[🌸❤️✅⏳💊🩺👦📅⚡]/g, '').trim();

    const targetLangCode = forcedLangCode || getPatientLangCode();
    const langPrefix = targetLangCode.split('-')[0].toLowerCase();
    const prefLangName = getPatientLangName();

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => 
      v.lang.toLowerCase() === targetLangCode.toLowerCase() || 
      v.lang.toLowerCase().startsWith(langPrefix)
    );

    if (!matchingVoice && targetLangCode !== 'en-IN' && targetLangCode !== 'en-US') {
      console.warn(`[Smriti Voice] No matching voice engine found in browser for language: ${prefLangName} (${targetLangCode}). Skipping audio playback.`);
      setIsSpeakingAloud(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = targetLangCode;
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

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

  // Convert audio blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Clean stop for recording session
  const stopVoiceRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    isRecordingRef.current = false;
    setRecordingSeconds(0);
  };

  // Universal Audio Recording (Works 100% in Brave, Chrome, Firefox, Safari)
  const toggleVoiceInput = async () => {
    stopSpeaking();

    if (isRecordingRef.current) {
      stopVoiceRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];
      setIsRecording(true);
      isRecordingRef.current = true;
      setRecordingSeconds(0);
      setMicStatusMsg('');

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/webm') 
            ? 'audio/webm' 
            : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 'audio/ogg'));

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }

        setIsRecording(false);
        isRecordingRef.current = false;
        setRecordingSeconds(0);

        if (audioChunksRef.current.length > 0) {
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            if (audioBlob.size > 1000) {
              const base64Audio = await blobToBase64(audioBlob);
              handleSendAudio(base64Audio, mimeType);
            } else {
              setMicStatusMsg("Didn't catch that, please speak and tap Stop & Send 😊");
              setTimeout(() => setMicStatusMsg(''), 4000);
            }
          } catch (err) {
            console.error('Audio processing error:', err);
          }
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 45) {
            stopVoiceRecording();
            return 45;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Microphone access error:', err);
      setIsRecording(false);
      isRecordingRef.current = false;
      setMicStatusMsg('Microphone blocked. Please click the lock icon in your browser address bar to allow mic access.');
      setTimeout(() => setMicStatusMsg(''), 6000);
    }
  };

  // Send audio recording to backend
  const handleSendAudio = async (base64Audio, mimeType) => {
    if (!base64Audio || isLoading || isSendingRef.current) return;
    isSendingRef.current = true;

    const tempMsgId = `user-voice-${Date.now()}`;
    const userMsg = {
      id: tempMsgId,
      sender: 'user',
      text: '🎙️ Transcribing your voice...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const resolvedPatientId = activePatient?._id || activePatient?.id || activePatientId || 'pat-1';

      const res = await sendPatientChatMessage(
        resolvedPatientId,
        '',
        historyPayload,
        base64Audio,
        mimeType
      );

      const actualTranscript = res.transcription || 'Voice Question';
      setMessages(prev => prev.map(m => m.id === tempMsgId ? { ...m, text: actualTranscript } : m));

      const replyText = res.reply || `Hello! I am Smriti, right here with you. How can I assist you?`;

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (autoSpeakEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      console.error('Audio chat error:', err);

      setMessages(prev => prev.map(m => m.id === tempMsgId ? { ...m, text: '🎙️ Voice Message' } : m));

      const serverErrorMessage = err?.response?.data?.reply || err?.response?.data?.details || err?.message || 'Failed to process voice recording';

      const errorBotMsg = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: serverErrorMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorBotMsg]);
      if (autoSpeakEnabled) {
        speakText(errorBotMsg.text);
      }
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  // Send typed message to backend
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading || isSendingRef.current) return;
    isSendingRef.current = true;

    stopSpeaking();
    stopVoiceRecording();
    setInputQuery('');
    setMicStatusMsg('');

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const resolvedPatientId = activePatient?._id || activePatient?.id || activePatientId || 'pat-1';

      const res = await sendPatientChatMessage(
        resolvedPatientId,
        query,
        historyPayload
      );

      const replyText = res.reply || `Hello! I am Smriti, right here with you. How can I assist you?`;

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

      if (autoSpeakEnabled) {
        speakText(replyText);
      }
    } catch (err) {
      console.error('Chat send error:', err);

      const serverErrorMessage = err?.response?.data?.reply || err?.response?.data?.details || err?.message || 'Failed to connect to assistant';

      const errorBotMsg = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: serverErrorMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorBotMsg]);
      if (autoSpeakEnabled) {
        speakText(errorBotMsg.text);
      }
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleClearHistory = () => {
    stopSpeaking();
    stopVoiceRecording();
    const initial = [
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. I am ready to help you again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    sessionStorage.removeItem(`smriti_chat_${activePatientId}`);
  };

  const quickPrompts = [
    { label: "What is my next medicine?", query: "What is my next scheduled medicine and when should I take it?", icon: Pill },
    { label: "Who is my doctor?", query: "Who is my primary doctor and caregiver?", icon: Stethoscope },
    { label: "Remind me about my family", query: "Can you remind me about my family members and memories?", icon: Heart },
    { label: "What routines are due today?", query: "What are my daily routines scheduled for today?", icon: Calendar }
  ];

  if (!isPatientLoggedIn) return null;

  return (
    <>
      {/* 1. FLOATING CIRCULAR BUTTONS (FIXED BOTTOM-RIGHT) */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-3.5">
          
          {/* Direct WhatsApp Bot Link (wa.me) */}
          <a
            href="https://wa.me/15556680031?text=Hi%20Smriti"
            target="_blank"
            rel="noopener noreferrer"
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer relative group bg-[#25D366] hover:bg-[#20bd5a] hover:scale-105 active:scale-95 ring-4 ring-[#25D366]/25 shrink-0"
            title="Chat with Smriti on WhatsApp"
            aria-label="Chat with Smriti on WhatsApp"
          >
            <svg
              viewBox="0 0 24 24"
              width="32"
              height="32"
              fill="currentColor"
              className="w-8 h-8 fill-current"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          {/* In-app Gemini AI Assistant */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              if (isSpeakingAloud) stopSpeaking();
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer relative group bg-[#2C5AA0] hover:bg-[#224780] hover:scale-105 active:scale-95 ring-4 ring-[#2C5AA0]/20 shrink-0"
            title="Open Smriti AI Assistant"
            aria-label="Open AI Assistant"
          >
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-8 h-8" />
            </div>

            {(isSpeakingAloud || isRecording) && (
              <span className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping" />
            )}
          </button>

        </div>
      )}

      {/* 2. CHAT WINDOW PANEL (POPUP OR FULLSCREEN) */}
      {isOpen && (
        <div 
          className={
            isFullScreen
              ? "fixed inset-0 z-50 w-screen h-screen bg-[#FAF7F2] flex flex-col overflow-hidden animate-in fade-in duration-200 font-sans"
              : "fixed inset-0 sm:inset-auto sm:bottom-8 sm:right-8 w-screen sm:w-[450px] sm:max-w-lg h-screen sm:h-[620px] sm:max-h-[85vh] bg-white sm:rounded-3xl shadow-2xl sm:border border-[#E5E0D8] flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 font-sans"
          }
        >
          
          {/* Header */}
          <div className="bg-[#2C5AA0] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0 shadow-xs">
            
            <div className={`flex items-center gap-2.5 sm:gap-3.5 w-full justify-between`}>
              
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    stopVoiceRecording();
                    setIsOpen(false);
                  }}
                  className="sm:hidden p-2 rounded-xl bg-white/15 active:bg-white/25 text-white flex items-center gap-1 font-bold text-xs cursor-pointer"
                  title="Close and go back"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  <span>Back</span>
                </button>

                <div className="relative">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-xs">
                    <FoxtailOrchidIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#2C5AA0] shadow-xs" />
                </div>

                <div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight leading-tight">
                    Smriti Assistant
                  </h3>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                
                {/* Voice Read-Aloud Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeakingAloud) stopSpeaking();
                    setAutoSpeakEnabled(!autoSpeakEnabled);
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    autoSpeakEnabled 
                      ? 'bg-white/20 text-white hover:bg-white/30 shadow-xs' 
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                  title={autoSpeakEnabled ? 'Voice read-aloud active (tap to mute)' : 'Voice read-aloud muted (tap to enable)'}
                >
                  {autoSpeakEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                {/* Expand / Minimize Fullscreen Button (Desktop Only) */}
                <button
                  type="button"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="hidden sm:flex p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shadow-xs"
                  title={isFullScreen ? "Exit full screen" : "Expand to full screen"}
                  aria-label={isFullScreen ? "Minimize" : "Expand"}
                >
                  {isFullScreen ? (
                    <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* Clear History */}
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Close Window (Desktop) */}
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    stopVoiceRecording();
                    setIsOpen(false);
                  }}
                  className="hidden sm:flex p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

              </div>

            </div>

          </div>

          {/* Status / Alert Banner */}
          {micStatusMsg && (
            <div className="bg-[#FDF2F2] border-b border-[#F5B7B1] px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-bold text-[#C0392B] shrink-0 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#C0392B] shrink-0" />
              <span>{micStatusMsg}</span>
            </div>
          )}

          {/* Live Recording Active Banner */}
          {isRecording && (
            <div className="bg-[#FDF2F2] border-b border-[#F5B7B1] px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-bold text-[#C0392B] shadow-xs">
              <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
                <span className="w-3.5 h-3.5 rounded-full bg-[#C0392B] animate-ping shrink-0" />
                <span className="px-2.5 py-1 rounded-full bg-rose-200 text-[#C0392B] font-mono text-xs font-black shadow-xs">
                  {`00:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`}
                </span>
                <span className="truncate">Recording your voice... Speak clearly</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-white font-black cursor-pointer shrink-0 ml-2 bg-[#C0392B] hover:bg-[#a93226] px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all text-xs sm:text-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Send</span>
              </button>
            </div>
          )}

          {isSpeakingAloud && (
            <div className="bg-[#EFF4FA] border-b border-[#2C5AA0]/20 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold text-[#2C5AA0] shrink-0">
              <span className="flex items-center gap-2 max-w-5xl mx-auto w-full">
                <Volume2 className="w-4 h-4 text-[#2C5AA0] animate-bounce" />
                <span>Speaking reply aloud...</span>
              </span>
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-[#2C5AA0] underline font-black cursor-pointer shrink-0 ml-2"
              >
                Stop Audio
              </button>
            </div>
          )}

          {/* Message History Area */}
          <div className="flex-1 overflow-y-auto bg-[#FAF7F2]/60">
            <div className={`${isFullScreen ? 'max-w-4xl mx-auto p-6 sm:p-8 space-y-6' : 'p-4 sm:p-5 space-y-4'}`}>
              
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold shadow-xs ${
                      isUser 
                        ? 'bg-[#2C5AA0] text-white' 
                        : 'bg-[#EFF4FA] border border-[#2C5AA0]/30 text-[#2C5AA0]'
                    }`}>
                      {isUser ? <User className="w-5 h-5" /> : <FoxtailOrchidIcon className="w-5 h-5 text-[#2C5AA0]" />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[85%] sm:max-w-[80%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      <div className={`p-4 sm:p-5 rounded-3xl leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-[#2C5AA0] text-white rounded-tr-xs font-medium text-base sm:text-lg'
                          : 'bg-white text-[#2B2B2B] border border-[#E5E0D8] rounded-tl-xs font-medium text-base sm:text-lg'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Bottom Timestamp & Voice replay button for assistant */}
                      <div className={`flex items-center gap-3 text-xs sm:text-sm text-[#6B6B6B] font-medium px-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            className="hover:text-[#2C5AA0] font-bold flex items-center gap-1.5 cursor-pointer text-[#2C5AA0] bg-[#EFF4FA] px-3 py-1 rounded-full border border-[#2C5AA0]/20 shadow-2xs hover:bg-[#dce8f5] transition-colors"
                            title="Listen to this message again"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Aloud</span>
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EFF4FA] border border-[#2C5AA0]/30 text-[#2C5AA0] shrink-0 flex items-center justify-center text-sm shadow-xs">
                    <FoxtailOrchidIcon className="w-5 h-5 text-[#2C5AA0] animate-pulse" />
                  </div>
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E5E0D8] rounded-tl-xs shadow-xs flex items-center gap-3 text-[#6B6B6B] text-base font-bold">
                    <Loader2 className="w-5 h-5 text-[#2C5AA0] animate-spin" />
                    <span className="text-sm sm:text-base text-[#6B6B6B]">Thinking for you...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />

            </div>
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="bg-stone-50 border-t border-[#E5E0D8] shrink-0 py-2.5">
            <div className={`${isFullScreen ? 'max-w-4xl mx-auto px-6' : 'px-4'} overflow-x-auto no-scrollbar flex items-center gap-2.5`}>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.query)}
                  className="shrink-0 px-4 py-2.5 rounded-full bg-white hover:bg-[#EFF4FA] hover:border-[#2C5AA0] text-[#2B2B2B] hover:text-[#2C5AA0] border border-[#E5E0D8] text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-2 min-h-[44px]"
                >
                  <p.icon className="w-4 h-4 text-[#2C5AA0]" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input & Action Bar */}
          <div className="bg-white border-t border-[#E5E0D8] shrink-0">
            <div className={`${isFullScreen ? 'max-w-4xl mx-auto p-4 sm:p-6' : 'p-3.5 sm:p-4'}`}>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2.5 sm:gap-3"
              >
                {/* Responsive Hardware Mic Button (Min 56px) */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                  className={`w-14 h-14 rounded-2xl transition-all shrink-0 shadow-xs flex items-center justify-center min-h-[56px] min-w-[56px] ${
                    isLoading 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-[#E5E0D8]'
                      : (isRecording
                          ? 'bg-[#C0392B] text-white animate-pulse ring-4 ring-rose-400/40 cursor-pointer'
                          : 'bg-[#EFF4FA] hover:bg-[#2C5AA0] text-[#2C5AA0] hover:text-white active:scale-95 border border-[#2C5AA0]/30 cursor-pointer')
                  }`}
                  title={isLoading ? 'Thinking...' : (isRecording ? 'Tap to finish speaking and send' : 'Tap to speak')}
                  aria-label="Voice input"
                >
                  {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={isLoading ? "Thinking..." : (isRecording ? "Recording your voice..." : "Type or tap mic to speak...")}
                  disabled={isLoading || isRecording}
                  className={`flex-1 min-h-[56px] py-3.5 sm:py-4 px-4 sm:px-5 border-2 rounded-2xl text-base font-medium text-[#2B2B2B] placeholder:text-stone-400 focus:outline-none transition-all shadow-2xs ${
                    isRecording 
                      ? 'bg-[#FDF2F2] border-[#F5B7B1]' 
                      : 'bg-[#FAF7F2] border-[#E5E0D8] focus:border-[#2C5AA0] focus:bg-white'
                  }`}
                />

                {/* Send Button (Min 56px) */}
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading || isRecording}
                  className={`w-14 h-14 rounded-2xl text-white font-black transition-all shrink-0 shadow-xs flex items-center justify-center min-h-[56px] min-w-[56px] ${
                    inputQuery.trim() && !isLoading && !isRecording
                      ? 'bg-[#2C5AA0] hover:bg-[#224780] active:scale-95 cursor-pointer'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </form>

            </div>
          </div>

        </div>
      )}
    </>
  );
}
