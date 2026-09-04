import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  MessageSquare, 
  Smartphone, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  Check
} from 'lucide-react';

export default function NotificationPreferences({
  currentPreference = 'whatsapp',
  onSave,
  isPatient = false,
  compact = false
}) {
  const { t } = useTranslation();
  const [selectedChannel, setSelectedChannel] = useState(currentPreference || 'whatsapp');
  const [saveStatus, setSaveStatus] = useState(''); // 'saving' | 'saved'

  const handleSelect = async (channelId) => {
    if (channelId !== 'whatsapp') return; // SMS and IVR are Coming Soon
    setSelectedChannel(channelId);
    if (onSave) {
      setSaveStatus('saving');
      try {
        await onSave(channelId);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2500);
      } catch (e) {
        setSaveStatus('');
      }
    }
  };

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      description: t('notifPref.whatsAppDesc'),
      status: 'active',
      statusLabel: t('notifPref.active'),
      icon: MessageSquare,
      color: 'emerald'
    },
    {
      id: 'sms',
      name: 'SMS',
      description: t('notifPref.smsDesc'),
      status: 'coming_soon',
      statusLabel: t('notifPref.comingSoon'),
      icon: Smartphone,
      color: 'slate'
    },
    {
      id: 'ivr',
      name: 'IVR Call',
      description: t('notifPref.ivrDesc'),
      status: 'coming_soon',
      statusLabel: t('notifPref.comingSoon'),
      icon: PhoneCall,
      color: 'slate'
    }
  ];

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] ${compact ? 'p-5' : 'p-6 sm:p-8'} space-y-5`}>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-100 shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t('notifPref.title')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('notifPref.subtitle')}
            </p>
          </div>
        </div>

        {saveStatus === 'saved' && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{t('notifPref.saved')}</span>
          </span>
        )}
      </div>

      {/* 3 Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isActive = channel.status === 'active';
          const isSelected = selectedChannel === channel.id;

          return (
            <div
              key={channel.id}
              onClick={() => isActive && handleSelect(channel.id)}
              className={`relative rounded-2xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between gap-3 ${
                isActive
                  ? (isSelected
                      ? 'bg-emerald-50/40 border-emerald-600 shadow-xs cursor-pointer ring-2 ring-emerald-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer')
                  : 'bg-slate-50/60 border-slate-200/60 opacity-65 cursor-not-allowed select-none'
              }`}
            >
              {/* Top Row: Icon + Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-600 border border-slate-300">
                    <span>Coming Soon</span>
                  </span>
                )}
              </div>

              {/* Middle: Name & Description */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {channel.name}
                  </h3>
                  {isSelected && isActive && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {channel.description}
                </p>
              </div>

              {/* Bottom State Label */}
              <div className="pt-2 border-t border-slate-100/80 text-[11px] font-semibold">
                {isActive ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('notifPref.whatsAppDefault')}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {t('notifPref.inDev')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* WhatsApp Quick Action Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {t('notifPref.chatBannerTitle')}
            </h4>
            <p className="text-xs text-slate-600">
              {t('notifPref.chatBannerDesc')}
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/15556680031?text=Hi%20Smriti"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-98 shrink-0 cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>{t('notifPref.chatButton')}</span>
        </a>
      </div>

    </div>
  );
}
