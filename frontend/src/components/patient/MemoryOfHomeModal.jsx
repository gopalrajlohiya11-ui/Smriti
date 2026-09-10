import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trees, 
  BookOpen, 
  Music, 
  Waves, 
  MapPin, 
  Heart, 
  Play, 
  Pause,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { NORTHEAST_STATES, getRegionById } from '../../data/regionalData';
import { ambientSynth } from '../../utils/ambientAudioSynth';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';

export default function MemoryOfHomeModal({ isOpen, onClose, selectedStateId, onSelectState, patientName = 'Elder' }) {
  const [activeTab, setActiveTab] = useState('sounds'); // 'sounds' | 'stories' | 'regions'
  const [currentRegion, setCurrentRegion] = useState(() => getRegionById(selectedStateId));
  const [activeSoundType, setActiveSoundType] = useState(null);
  const [isPlayingStory, setIsPlayingStory] = useState(false);
  const [activeStoryId, setActiveStoryId] = useState(null);

  useEffect(() => {
    if (selectedStateId) {
      setCurrentRegion(getRegionById(selectedStateId));
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (!isOpen) {
      ambientSynth.stop();
      stopSpeech();
      setActiveSoundType(null);
      setIsPlayingStory(false);
      setActiveStoryId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSound = (type) => {
    if (activeSoundType === type) {
      ambientSynth.stop();
      setActiveSoundType(null);
    } else {
      stopSpeech();
      setIsPlayingStory(false);
      setActiveStoryId(null);
      ambientSynth.playPreset(type);
      setActiveSoundType(type);
    }
  };

  const handlePlayStory = (story) => {
    if (activeStoryId === story.id && isPlayingStory) {
      stopSpeech();
      setIsPlayingStory(false);
      setActiveStoryId(null);
      return;
    }

    ambientSynth.stop();
    setActiveSoundType(null);
    setIsPlayingStory(true);
    setActiveStoryId(story.id);

    const speechText = story.title + '. ' + story.summary;
    speakLocalized({
      text: speechText,
      langCode: 'en',
      rate: 0.95,
      pitch: 1.0,
      onEnd: () => {
        setIsPlayingStory(false);
        setActiveStoryId(null);
      },
      onError: () => {
        setIsPlayingStory(false);
        setActiveStoryId(null);
      }
    });
  };

  const handleStateChange = (st) => {
    setCurrentRegion(st);
    if (onSelectState) onSelectState(st.id);
    ambientSynth.stop();
    stopSpeech();
    setActiveSoundType(null);
    setIsPlayingStory(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border-2 border-stone-300 overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="bg-[#0E382B] text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0E382B] via-[#1B4D3E] to-[#0E382B] opacity-90" />
          
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner shrink-0 text-emerald-300">
              <Trees className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                  Reminiscence Therapy
                </span>
                <span className="text-xs text-white/80 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  {currentRegion.prominentCity}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                <span>Memory of Home</span>
                <span className="text-xs font-normal text-white/70">({currentRegion.nativeName})</span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white px-5 sm:px-6 py-3 border-b border-stone-200 flex items-center gap-2 shrink-0">
          {[
            { id: 'sounds', label: 'Ambient Nature Sounds', icon: Waves },
            { id: 'stories', label: 'Hometown Memories', icon: BookOpen },
            { id: 'regions', label: 'Change State / Region', icon: MapPin }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0E382B] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: NATURE SOUNDS */}
          {activeTab === 'sounds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EDF7F2] border border-[#A3D9C1] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Trees className="w-5 h-5 text-[#1F6B4A]" />
                  <p className="text-xs sm:text-sm font-medium text-[#1F6B4A]">
                    Calming ambient nature sounds rooted in the landscapes of {currentRegion.name}.
                  </p>
                </div>
                {activeSoundType && (
                  <button
                    type="button"
                    onClick={() => handleToggleSound(activeSoundType)}
                    className="px-3 py-1.5 rounded-lg bg-[#1F6B4A] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Sound</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentRegion.ambientPresets.map((preset) => {
                  const isPlaying = activeSoundType === preset.type;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleToggleSound(preset.type)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isPlaying
                          ? 'bg-[#0E382B] text-white border-[#0E382B] shadow-md ring-2 ring-[#0E382B]/30'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl select-none">{preset.icon}</span>
                        <div>
                          <p className="text-sm font-black">{preset.title}</p>
                          <p className={`text-xs ${isPlaying ? 'text-emerald-200' : 'text-stone-500'}`}>
                            {isPlaying ? 'Playing continuous soothing audio...' : 'Tap to play'}
                          </p>
                        </div>
                      </div>

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPlaying ? 'bg-amber-400 text-stone-900 shadow-sm' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isPlaying ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 fill-current" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: HOMETOWN MEMORIES & REMINISCENCE STORIES */}
          {activeTab === 'stories' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-700 shrink-0" />
                <p className="text-xs sm:text-sm text-amber-800 font-medium">
                  Spoken reminiscence vignettes designed to stimulate autobiographical memory, temporal grounding, and comforting nostalgia.
                </p>
              </div>

              <div className="space-y-3">
                {currentRegion.stories.map((story) => {
                  const isPlaying = isPlayingStory && activeStoryId === story.id;
                  return (
                    <div
                      key={story.id}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                        isPlaying
                          ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black px-2 py-0.5 rounded-md bg-[#0E382B] text-white">
                              {story.timeHint}
                            </span>
                            <h4 className="text-base font-black text-stone-900">{story.title}</h4>
                          </div>
                          <p className="text-xs text-stone-500 italic">{story.nativeTitle}</p>
                          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
                            {story.summary}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePlayStory(story)}
                          className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs ${
                            isPlaying
                              ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-black'
                              : 'bg-[#0E382B] hover:bg-[#144d3b] text-white'
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span>Pause Story</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              <span>Listen Story</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REGION SWITCHER */}
          {activeTab === 'regions' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Choose the patient's home state to personalize daily greetings, landscape horizons, local textile motifs, and reminiscence content across the entire application:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {NORTHEAST_STATES.map((st) => {
                  const isSelected = currentRegion.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleStateChange(st)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#EDF7F2] border-[#1F6B4A] shadow-md ring-2 ring-[#1F6B4A]/20'
                          : 'bg-white border-stone-200 hover:border-emerald-600 hover:bg-emerald-50/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl select-none">{st.emblemEmoji}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-stone-900 truncate">{st.name}</p>
                          <p className="text-xs text-stone-500 truncate">{st.capital}</p>
                          <p className="text-[11px] text-emerald-700 font-medium truncate">{st.proverb}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-[#1F6B4A] shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white p-4 sm:p-5 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">Active Region:</span>
            <span className="text-xs font-black text-[#0E382B] px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1">
              <span>{currentRegion.emblemEmoji}</span>
              <span>{currentRegion.name}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-[#0E382B] hover:bg-[#144d3b] text-white font-black text-sm cursor-pointer shadow-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
