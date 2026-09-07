import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';
import { familyPhotos } from '../../data/mockData';
import { speakLocalized, stopSpeech } from '../../utils/speechUtils';
import PatientNavShell from '../../components/patient/PatientNavShell';
import { 
  Heart, 
  Volume2, 
  X, 
  MapPin, 
  Calendar, 
  Sparkles,
  Users,
  Search
} from 'lucide-react';

const HINDI_PHOTO_AUDIO = {
  'fam-1': 'यह आपके पोते अर्जुन हैं, जो गुवाहाटी नदी तट पर बीहू नृत्य के बाद मुस्कुरा रहे हैं।',
  'fam-2': 'यह आपकी बेटी डॉ. अनन्या हैं, जो गौहाटी मेडिकल कॉलेज से गोल्ड मेडल प्राप्त कर रही हैं।',
  'fam-3': 'यह जोरहाट का पैतृक घर है जहाँ आप सुबह की असम चाय और अखबार का आनंद लेते थे।',
  'fam-4': 'यह आपके पूरे परिवार की शिलांग के एलिफेंट फॉल्स की यादगार छुट्टी है।'
};

export default function PatientFamily() {
  const { t } = useTranslation();
  const { activePatient, loadPatientPhotos, currentLanguage } = useApp();
  
  const [vaultPhotos, setVaultPhotos] = useState(familyPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (activePatient?.id || activePatient?._id) {
      loadPatientPhotos(activePatient.id || activePatient._id).then(dbPhotos => {
        if (isMounted && dbPhotos && Array.isArray(dbPhotos) && dbPhotos.length > 0) {
          setVaultPhotos(dbPhotos);
        }
      });
    }
    return () => { 
      isMounted = false; 
      stopSpeech();
    };
  }, [activePatient, loadPatientPhotos]);

  const speakText = (text) => {
    speakLocalized({
      text,
      langCode: currentLanguage?.code || 'en',
      rate: 0.85,
      pitch: 1.0,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  // Filter categories
  const isHindi = (currentLanguage?.code || '').startsWith('hi');
  const filterTabs = [
    { id: 'all', label: isHindi ? 'सभी तस्वीरें' : 'All Photos' },
    { id: 'grandson', label: isHindi ? 'पोते-पोतियां' : 'Grandchildren' },
    { id: 'daughter', label: isHindi ? 'बच्चे और परिवार' : 'Children & Family' },
    { id: 'home', label: isHindi ? 'घर और यादगार स्थान' : 'Homes & Places' }
  ];

  const filteredPhotos = useMemo(() => {
    return vaultPhotos.filter(photo => {
      const matchFilter = selectedFilter === 'all' || 
        (photo.relation || '').toLowerCase().includes(selectedFilter.toLowerCase()) ||
        (photo.title || '').toLowerCase().includes(selectedFilter.toLowerCase());
      
      const matchSearch = !searchQuery || 
        (photo.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.relation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (photo.location || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [vaultPhotos, selectedFilter, searchQuery]);

  return (
    <PatientNavShell pageTitle="Family Memories & Photos">
      <div className="space-y-6">
        
        {/* Header Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF6F0] border border-[#B5502E]/20 text-[#B5502E] flex items-center justify-center shrink-0">
                <Heart className="w-7 h-7 fill-[#B5502E]/20" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#2B2B2B]">
    {isHindi ? "पारिवारिक यादें और तस्वीरें" : "Family Memories & Photos"}
  </h2>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-medium">
                  {isHindi ? "पारिवारिक यादें सुनने के लिए किसी भी तस्वीर को स्पर्श करें" : "Tap any photo to listen to family stories"}
                </p>
              </div>
            </div>

            {/* Read Page Audio */}
            <button
              type="button"
              onClick={() => speakText("This is your family memory album. Tap any picture below to listen to its story and recall happy moments together.")}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-[#EFF4FA] hover:bg-[#2C5AA0] text-[#2C5AA0] hover:text-white border border-[#2C5AA0]/30 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer self-start sm:self-center shrink-0 active:scale-95"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isHindi ? "सारांश सुनें" : "Listen to Summary"}</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shrink-0 ${
                  selectedFilter === tab.id
                    ? 'bg-[#B5502E] text-white border-[#B5502E] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#2B2B2B] hover:bg-stone-100 border-[#E5E0D8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid: 2 Columns on Tablet/Desktop, 1 on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo._id || photo.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E0D8] shadow-2xs hover:shadow-md hover:border-[#B5502E]/40 transition-all flex flex-col justify-between gap-4 group"
            >
              <div 
                onClick={() => setSelectedPhoto(photo)}
                className="cursor-pointer space-y-3"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-[#E5E0D8]">
                  <img
                    src={photo.photoUrl || photo.imageUrl || photo.image || photo.url || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80'}
                    alt={photo.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {photo.relation && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#B5502E] border border-[#B5502E]/20 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                      {photo.relation}
                    </span>
                  )}
                  {photo.year && (
                    <span className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      {photo.year}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-[#2B2B2B] group-hover:text-[#B5502E] transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#6B6B6B] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#B5502E]" />
                    <span>{photo.location || 'Assam, India'}</span>
                  </p>
                  <p className="text-xs text-[#6B6B6B] line-clamp-2 mt-1">
                    {photo.description || photo.audioPrompt || photo.audioNote}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  const isHindi = (currentLanguage?.code || '').startsWith('hi');
                  const msg = isHindi && HINDI_PHOTO_AUDIO[photo.id] ? HINDI_PHOTO_AUDIO[photo.id] : `${photo.title}. ${photo.audioPrompt || photo.audioNote || photo.description}`;
                  speakText(msg);
                }}
                className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-[#EFF4FA] hover:bg-[#2C5AA0] text-[#2C5AA0] hover:text-white border border-[#2C5AA0]/30 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-2xs"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isHindi ? "कहानी सुनें 🔊" : "Listen to Story 🔊"}</span>
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Full-Screen Photo Details Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-[#E5E0D8] shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPhoto.photoUrl || selectedPhoto.imageUrl || selectedPhoto.image || selectedPhoto.url || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80'}
              alt={selectedPhoto.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80';
              }}
              className="w-full aspect-[4/3] object-cover"
            />

            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] bg-stone-100 px-2.5 py-0.5 rounded-md border border-[#E5E0D8]">
                    {selectedPhoto.year} • {selectedPhoto.location}
                  </span>
                  {selectedPhoto.relation && (
                    <span className="text-xs font-bold text-[#B5502E] bg-[#FDF6F0] px-2.5 py-0.5 rounded-md border border-[#B5502E]/20">
                      {selectedPhoto.relation}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-[#2B2B2B] mt-2">
                  {selectedPhoto.title}
                </h3>
                <p className="text-[#6B6B6B] text-sm mt-1 leading-relaxed">
                  {selectedPhoto.description || selectedPhoto.audioNote || selectedPhoto.audioPrompt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                const isHindi = (currentLanguage?.code || '').startsWith('hi');
                const msg = isHindi && HINDI_PHOTO_AUDIO[selectedPhoto.id] ? HINDI_PHOTO_AUDIO[selectedPhoto.id] : `${selectedPhoto.title}. ${selectedPhoto.audioNote || selectedPhoto.audioPrompt || selectedPhoto.description}`;
                speakText(msg);
              }}
                className="w-full min-h-[56px] rounded-2xl bg-[#2C5AA0] hover:bg-[#224780] text-white font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Volume2 className="w-5 h-5" />
                <span>{isHindi ? "यादें सुनें 🔊" : "Listen to Family Memory 🔊"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientNavShell>
  );
}
