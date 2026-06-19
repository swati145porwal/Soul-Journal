import React from 'react';
import { MoodEntry, TimeSlot } from '../types';
import { TIME_SLOT_CONFIG, MOOD_COLORS } from '../constants';
import { Clock, Plus } from 'lucide-react';

interface JournalViewProps {
  date: Date;
  entries: MoodEntry[];
  onAddEntry: (slot: TimeSlot) => void;
  onEditEntry: (entry: MoodEntry) => void;
}

const JournalView: React.FC<JournalViewProps> = ({ date, entries, onAddEntry, onEditEntry }) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const slots = [TimeSlot.MORNING, TimeSlot.AFTERNOON, TimeSlot.EVENING, TimeSlot.NIGHT];

  return (
    <div className="bg-white rounded-[2rem] border border-brand-light shadow-sm overflow-hidden mb-10 transition-all hover:shadow-md">
      {/* Header Info */}
      <div className="p-6 border-b border-brand-light flex justify-between items-center bg-brand-soft/30">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-clay opacity-60">Daily Ledger</p>
          <h4 className="text-[#515783] font-display font-bold text-xl">{dayName}</h4>
        </div>
        <div className="text-right">
          <p className="text-[#515783] font-medium text-sm border-b border-brand-primary/20 pb-0.5">{dateStr}</p>
        </div>
      </div>

      {/* Horizontal Scroll Wrapper */}
      <div className="overflow-x-auto no-scrollbar custom-scrollbar">
        <div className="min-w-[600px]">
          {/* Grid Table Header */}
          <div className="grid grid-cols-[100px_100px_100px_120px_1fr] border-b border-brand-light bg-brand-soft/20">
            {['WHEN', 'TIME', 'MOOD', 'EMOTIONS', 'ACTIVITY JOURNAL'].map((header, i) => (
              <div key={i} className="p-4 text-[9px] font-black text-brand-clay/60 uppercase tracking-[0.2em] text-center flex items-center justify-center border-r border-brand-light last:border-r-0">
                {header}
              </div>
            ))}
          </div>

          {/* Rows */}
          {slots.map((slot) => {
            const entry = entries.find(e => e.timeSlot === slot);
            return (
              <div 
                key={slot} 
                className="grid grid-cols-[100px_100px_100px_120px_1fr] border-b border-brand-light last:border-b-0 min-h-[90px] group cursor-pointer hover:bg-brand-soft transition-colors"
                onClick={() => entry ? onEditEntry(entry) : onAddEntry(slot)}
              >
                <div className="p-4 flex items-center justify-center text-brand-dark font-black text-xs border-r border-brand-light group-hover:text-brand-primary transition-colors">
                  {slot}
                </div>
                <div className="p-4 flex flex-col items-center justify-center border-r border-brand-light gap-1">
                  <Clock size={12} className="text-brand-clay/40" />
                  <span className="text-brand-clay/70 font-bold text-[10px] tracking-tighter">
                    {TIME_SLOT_CONFIG[slot].time}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-center border-r border-brand-light">
                  {entry ? (
                    <div 
                      className={`w-10 h-10 rounded-2xl ${MOOD_COLORS[entry.generalMood]} shadow-sm flex items-center justify-center text-white ring-4 ring-white transition-transform group-hover:scale-110`}
                      title={entry.generalMood}
                    >
                      <span className="text-[10px] font-black uppercase">{entry.generalMood.charAt(0)}</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl border-2 border-dashed border-brand-light flex items-center justify-center text-brand-light transition-all group-hover:border-brand-primary group-hover:text-brand-primary">
                       <Plus size={16} />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-wrap gap-1 items-center justify-center border-r border-brand-light">
                  {entry ? (
                    entry.specificEmotions.map(em => (
                      <span key={em} className="px-2 py-0.5 bg-brand-light text-brand-clay text-[9px] font-black rounded-md uppercase tracking-wider">
                        {em}
                      </span>
                    ))
                  ) : (
                    <span className="text-brand-light italic text-[10px]">-</span>
                  )}
                </div>
                <div className="p-4 flex items-center text-xs text-brand-dark font-medium leading-relaxed group-hover:translate-x-1 transition-transform">
                  {entry ? (
                    <p className="line-clamp-2 italic opacity-80">"{entry.activity}"</p>
                  ) : (
                    <span className="text-brand-light font-normal">Tap to record this flow...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 bg-brand-soft/10 text-center">
        <p className="text-[10px] text-brand-clay/40 font-bold uppercase tracking-[0.2em]">Swipe table horizontally to reveal all details</p>
      </div>
    </div>
  );
};

export default JournalView;