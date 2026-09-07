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

    </div>
  );
}

