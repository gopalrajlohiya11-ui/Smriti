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
  Calendar
} from 'lucide-react';

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
  const { activePatient, activePatientId, isPatientLoggedIn } = useApp();

  const getPatientLangCode = () => {
    const raw = (activePatient?.preferredLanguage || activePatient?.language || activePatient?.nativeLanguage || 'english').toLowerCase().trim();
    return LANGUAGE_CODE_MAP[raw] || 'en-IN';
  };

  const getPatientLangName = () => {
    return activePatient?.preferredLanguage || activePatient?.language || activePatient?.nativeLanguage || 'English';
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
        text: `Hello! I am Smriti, your caring companion. You can ask me about your medicines, today's schedule, doctor, or family anytime. 🌸`,
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
            text: `Hello! I am Smriti, your caring companion. You can ask me about your medicines, today's schedule, doctor, or family anytime. 🌸`,
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

      const replyText = res.reply || `Hello! I am Smriti, right here with you. How can I assist you? 🌸`;

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

      const replyText = res.reply || `Hello! I am Smriti, right here with you. How can I assist you? 🌸`;

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
        text: `Conversation cleared. I am ready to help you again! 🌸`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initial);
    sessionStorage.removeItem(`smriti_chat_${activePatientId}`);
  };

  const quickPrompts = [
    { label: "What is my next medicine? 💊", query: "What is my next scheduled medicine and when should I take it?", icon: Pill },
    { label: "Who is my doctor? 🩺", query: "Who is my primary doctor and caregiver?", icon: Stethoscope },
    { label: "Remind me about my family 🌸", query: "Can you remind me about my family members and memories?", icon: Heart },
    { label: "What routines are due today? 📅", query: "What are my daily routines scheduled for today?", icon: Calendar }
  ];

  if (!isPatientLoggedIn) return null;

  return (
    <>
      {/* 1. FLOATING CIRCULAR CHAT BUTTON (FIXED BOTTOM-RIGHT) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3">
          
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              if (isSpeakingAloud) stopSpeaking();
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer relative group bg-gradient-to-tr from-amber-800 via-amber-700 to-amber-800 hover:scale-110 active:scale-95 ring-4 ring-amber-800/20"
            title="Open Smriti"
            aria-label="Open AI Companion"
          >
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="absolute -top-1 -right-1 text-xs">🌸</span>
            </div>

            {(isSpeakingAloud || isRecording) && (
              <span className="absolute inset-0 rounded-full border-4 border-amber-400 animate-ping" />
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
              : "fixed bottom-20 sm:bottom-26 right-4 sm:right-8 w-[calc(100vw-32px)] sm:w-[450px] max-w-lg h-[620px] max-h-[84vh] bg-white rounded-3xl sm:rounded-[36px] shadow-2xl border border-stone-200/90 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 font-sans"
          }
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
            
            <div className={`flex items-center gap-3.5 ${isFullScreen ? 'max-w-5xl w-full mx-auto justify-between' : ''}`}>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-2xl shadow-sm">
                    🌸
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-amber-900 shadow-xs" />
                </div>

                <div>
                  <h3 className="font-black text-xl sm:text-2xl tracking-tight leading-tight">
                    Smriti
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
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    autoSpeakEnabled 
                      ? 'bg-white/20 text-amber-200 hover:bg-white/30 shadow-xs' 
                      : 'bg-white/10 text-stone-400 hover:bg-white/20'
                  }`}
                  title={autoSpeakEnabled ? 'Voice read-aloud active (tap to mute)' : 'Voice read-aloud muted (tap to enable)'}
                >
                  {autoSpeakEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                {/* Expand / Minimize Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer shadow-xs"
                  title={isFullScreen ? "Exit full screen (return to card)" : "Expand to full screen"}
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
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Close Window */}
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    stopVoiceRecording();
                    setIsOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                  title="Close chat"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

              </div>

            </div>

          </div>

          {/* Status / Alert Banner */}
          {micStatusMsg && (
            <div className="bg-amber-100 border-b border-amber-300 px-4 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-950 shrink-0 shadow-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
              <span>{micStatusMsg}</span>
            </div>
          )}

          {/* Live Recording Active Banner */}
          {isRecording && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-bold text-rose-900 shadow-xs">
              <div className="flex items-center gap-3 max-w-5xl mx-auto w-full">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                <span className="px-2.5 py-1 rounded-full bg-rose-200 text-rose-950 font-mono text-xs font-black shadow-xs">
                  {`00:${recordingSeconds < 10 ? '0' : ''}${recordingSeconds}`}
                </span>
                <span className="truncate">🎙️ Recording your voice... Speak comfortably and tap Stop & Send</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-white font-black cursor-pointer shrink-0 ml-2 bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all text-xs sm:text-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop & Send 🚀</span>
              </button>
            </div>
          )}

          {isSpeakingAloud && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-950 shrink-0 shadow-xs">
              <span className="flex items-center gap-2 max-w-5xl mx-auto w-full">
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800 animate-bounce" />
                <span>Speaking reply aloud for you...</span>
              </span>
              <button
                type="button"
                onClick={stopSpeaking}
                className="text-amber-800 underline font-black cursor-pointer shrink-0 ml-2"
              >
                Stop Audio ⏹️
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
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold shadow-xs ${
                      isUser 
                        ? 'bg-amber-800 text-white' 
                        : 'bg-amber-100 border-2 border-amber-300 text-amber-900'
                    }`}>
                      {isUser ? <User className="w-5 h-5" /> : '🌸'}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[85%] sm:max-w-[80%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      
                      <div className={`p-4 sm:p-5 rounded-3xl leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-amber-800 to-amber-900 text-white rounded-tr-xs font-medium text-base sm:text-lg'
                          : 'bg-white text-stone-900 border border-stone-200/90 rounded-tl-xs font-medium text-base sm:text-lg'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Bottom Timestamp & Voice replay button for assistant */}
                      <div className={`flex items-center gap-3 text-xs sm:text-sm text-stone-400 font-medium px-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => speakText(msg.text)}
                            className="hover:text-amber-800 font-bold flex items-center gap-1.5 cursor-pointer text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-2xs hover:bg-amber-100 transition-colors"
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
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-900 shrink-0 flex items-center justify-center text-sm shadow-xs">
                    🌸
                  </div>
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-stone-200/90 rounded-tl-xs shadow-xs flex items-center gap-3 text-stone-600 text-base font-bold">
                    <Loader2 className="w-5 h-5 text-amber-800 animate-spin" />
                    <span className="text-sm sm:text-base text-stone-600">Smriti is thinking for you...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />

            </div>
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="bg-stone-100/90 border-t border-stone-200/80 shrink-0 py-2.5">
            <div className={`${isFullScreen ? 'max-w-4xl mx-auto px-6' : 'px-4'} overflow-x-auto no-scrollbar flex items-center gap-2.5`}>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.query)}
                  className="shrink-0 px-3.5 py-2 rounded-full bg-white hover:bg-amber-50 hover:border-amber-300 text-stone-800 hover:text-amber-950 border border-stone-200 text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <p.icon className="w-3.5 h-3.5 text-amber-800" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input & Action Bar */}
          <div className="bg-white border-t border-stone-200 shrink-0">
            <div className={`${isFullScreen ? 'max-w-4xl mx-auto p-4 sm:p-6' : 'p-3.5 sm:p-4'}`}>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2.5 sm:gap-3"
              >
                {/* Responsive Hardware Mic Button */}
                {/* Responsive Hardware Mic Button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                  className={`p-3.5 sm:p-4 rounded-2xl transition-all shrink-0 shadow-xs flex items-center justify-center ${
                    isLoading 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                      : (isRecording
                          ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-400/40 cursor-pointer'
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900 active:scale-95 border border-amber-300 cursor-pointer')
                  }`}
                  title={isLoading ? 'Smriti is thinking...' : (isRecording ? 'Tap to finish speaking and send' : 'Tap to speak your question')}
                  aria-label="Voice input"
                >
                  {isRecording ? <Square className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />}
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={isLoading ? "Smriti is thinking..." : (isRecording ? "Recording your voice... Speak now!" : "Type or tap the mic to speak...")}
                  disabled={isLoading || isRecording}
                  className={`flex-1 py-3.5 sm:py-4 px-4 sm:px-5 border-2 rounded-2xl text-base sm:text-lg font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none transition-all shadow-inner ${
                    isRecording 
                      ? 'bg-rose-50/40 border-rose-400 ring-4 ring-rose-300/20' 
                      : 'bg-stone-50 border-stone-300 focus:border-amber-800 focus:bg-white focus:ring-4 focus:ring-amber-800/10'
                  }`}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading || isRecording}
                  className={`p-3.5 sm:p-4 rounded-2xl text-white font-black transition-all shrink-0 shadow-md ${
                    inputQuery.trim() && !isLoading && !isRecording
                      ? 'bg-amber-800 hover:bg-amber-900 active:scale-95 cursor-pointer'
                      : 'bg-stone-300 text-stone-500 cursor-not-allowed'
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
