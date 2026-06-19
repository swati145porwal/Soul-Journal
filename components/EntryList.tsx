import React from 'react';
import { MoodEntry } from '../types';
import { MOOD_COLORS } from '../constants';
import { Trash2, Calendar, Clock, Pencil, RotateCcw } from 'lucide-react';

interface EntryListProps {
  entries: MoodEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: MoodEntry) => void;
  onUndo?: () => void;
  showUndo?: boolean;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onDelete, onEdit, onUndo, showUndo }) => {
  if (entries.length === 0 && !showUndo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Calendar size={48} className="mb-4 opacity-50" />
        <p>No entries yet. Start tracking today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Undo Banner */}
      {showUndo && onUndo && (
        <div className="bg-brand-dark text-white rounded-2xl p-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top-4 fade-in duration-300">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                 <Trash2 size={16} />
              </div>
              <span className="text-sm font-black lowercase tracking-tight">Entry deleted</span>
           </div>
           <button 
             onClick={onUndo}
             className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-brand-dark rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
           >
             <RotateCcw size={14} strokeWidth={3} /> Undo
           </button>
        </div>
      )}

      {entries.map((entry) => (
        <div 
          key={entry.id} 
          className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-12 rounded-full ${MOOD_COLORS[entry.generalMood]}`}></div>
              <div>
                <h3 className="font-bold text-brand-dark text-lg">{entry.generalMood}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                   <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(entry.timestamp).toLocaleDateString()}</span>
                   <span className="text-slate-300">•</span>
                   <span className="flex items-center gap-1"><Clock size={12}/> {entry.timeSlot}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onEdit(entry)}
                  className="p-2 text-slate-300 hover:text-brand-clay hover:bg-brand-light rounded-full transition-colors"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
            </div>
          </div>
          
          <div className="pl-6">
             {entry.specificEmotions.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-3">
                    {entry.specificEmotions.map(emotion => (
                        <span key={emotion} className="px-2 py-1 bg-brand-light text-brand-clay text-[10px] rounded-md font-black uppercase tracking-wider">
                            {emotion}
                        </span>
                    ))}
                 </div>
             )}
             
             {entry.activity && (
                 <div className="text-sm text-slate-600 bg-brand-bg/50 p-4 rounded-xl border border-brand-light/20 italic">
                    "{entry.activity}"
                 </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EntryList;