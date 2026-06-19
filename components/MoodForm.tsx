import React, { useState, useEffect } from 'react';
import { GeneralMood, MoodEntry, TimeSlot } from '../types';
import { EMOTION_TO_MOOD_MAP, EMOTION_WHEEL_DATA, TIME_SLOT_CONFIG } from '../constants';
import SunburstWheel from './SunburstWheel';
import { Save, X, ArrowLeft, ChevronRight, Check } from 'lucide-react';

interface MoodFormProps {
  initialData?: MoodEntry | null;
  initialDate?: Date | null;
  initialSlot?: TimeSlot | null;
  onSave: (mood: GeneralMood, emotions: string[], activity: string, slot: TimeSlot, date: Date, id?: string) => void;
  onCancel: () => void;
}

const MoodForm: React.FC<MoodFormProps> = ({ initialData, initialDate, initialSlot, onSave, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [inferredMood, setInferredMood] = useState<GeneralMood | null>(null);
  const [parentCategory, setParentCategory] = useState<string>("");
  
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState((initialDate || new Date()).toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(initialSlot || TimeSlot.MORNING);

  useEffect(() => {
    if (initialData) {
      const entryDate = new Date(initialData.timestamp);
      const emotion = initialData.specificEmotions[0];
      if (emotion) {
        setSelectedEmotion(emotion);
        let categoryFound = "";
        if (EMOTION_WHEEL_DATA.children) {
          for (const cat of EMOTION_WHEEL_DATA.children) {
            const checkNode = (node: any): boolean => {
              if (node.name === emotion) return true;
              if (node.children) return node.children.some((c: any) => checkNode(c));
              return false;
            };
            if (checkNode(cat)) { categoryFound = cat.name; break; }
          }
        }
        setParentCategory(categoryFound);
      }
      setInferredMood(initialData.generalMood);
      setActivity(initialData.activity || '');
      setDate(entryDate.toISOString().split('T')[0]);
      setSelectedSlot(initialData.timeSlot);
    } else if (initialDate) {
        setDate(initialDate.toISOString().split('T')[0]);
    }
  }, [initialData, initialDate]);

  const handleEmotionSelect = (emotion: string, category: string) => {
    setSelectedEmotion(emotion);
    setParentCategory(category);
    const mood = EMOTION_TO_MOOD_MAP[category] || GeneralMood.FINE;
    setInferredMood(mood);
    // Visual feedback delay
    setTimeout(() => setStep(2), 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inferredMood && selectedEmotion) {
      const slotHour = TIME_SLOT_CONFIG[selectedSlot].hour;
      const dateTime = new Date(date);
      dateTime.setHours(slotHour, 0, 0, 0);
      onSave(inferredMood, [selectedEmotion], activity, selectedSlot, dateTime, initialData?.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-brand-bg animate-in fade-in slide-in-from-bottom-6 duration-700 overflow-hidden">
      <div className="px-6 py-4 flex justify-between items-center bg-white/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
           {step === 2 && (
               <button onClick={() => setStep(1)} className="p-2 bg-white shadow-sm text-brand-dark rounded-xl transition-all active:scale-90">
                   <ArrowLeft size={20} />
               </button>
           )}
           <h2 className="text-xl font-black text-brand-dark lowercase tracking-tighter">
                {step === 1 ? 'Identify your soul' : 'Almost there'}
           </h2>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-300 hover:text-brand-primary rounded-xl transition-all active:scale-90">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {step === 1 ? (
          <div className="h-full flex flex-col items-center justify-between pb-4">
             {/* Wheel takes most of the space */}
             <div className="w-full flex-grow flex items-center justify-center p-2">
                 <SunburstWheel onSelectEmotion={handleEmotionSelect} selectedEmotion={selectedEmotion} />
             </div>
             
             {/* Info card is smaller and closer to the bottom */}
             <div className="w-full max-w-sm px-6 py-6 bg-white rounded-[2.5rem] shadow-xl shadow-brand-dark/5 text-center shrink-0 mx-auto">
                 {selectedEmotion ? (
                     <div className="animate-in zoom-in-95 duration-500">
                         <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-primary/20">
                             <Check size={20} strokeWidth={4} />
                         </div>
                         <p className="text-slate-400 text-[9px] uppercase font-black tracking-[0.4em] mb-1">Emotion Selected</p>
                         <h3 className="text-2xl font-black text-brand-primary uppercase tracking-tighter leading-none mb-0.5">{selectedEmotion}</h3>
                         <p className="text-brand-clay text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{parentCategory}</p>
                     </div>
                 ) : (
                     <div className="space-y-2 py-4">
                        <p className="text-brand-dark text-xl font-black tracking-tighter leading-none">Mapping your heart.</p>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">Touch the segments to find your current resonance.</p>
                     </div>
                 )}
             </div>
          </div>
        ) : (
          <div className="p-8 space-y-10 animate-in slide-in-from-right-6 duration-500">
              <div className="p-12 bg-white rounded-[3.5rem] border-2 border-[#FFD1B3] shadow-2xl shadow-brand-dark/5 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-brand-bg flex items-center justify-center text-6xl shadow-inner border-2 border-[#FFD1B3] mb-8">
                      {inferredMood === GeneralMood.GREAT ? '🌿' : 
                       inferredMood === GeneralMood.GOOD ? '☀️' :
                       inferredMood === GeneralMood.FINE ? '☁️' :
                       inferredMood === GeneralMood.BAD ? '🌧️' : '🌪️'}
                  </div>
                  <h3 className="font-black text-brand-dark text-4xl uppercase tracking-tighter mb-3">{selectedEmotion}</h3>
                  <div className="flex items-center gap-4">
                    <span className="px-5 py-2 bg-brand-primary text-white text-[11px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-brand-primary/20">{inferredMood}</span>
                    <span className="text-brand-clay font-black uppercase tracking-[0.3em] text-[10px] opacity-30">{selectedSlot} Flow</span>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                      <label className="block text-[10px] font-black text-brand-clay uppercase tracking-[0.4em] ml-4">Moment</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} className="w-full p-6 bg-white border-2 border-[#FFD1B3] rounded-[2rem] font-black text-brand-dark outline-none focus:ring-8 focus:ring-brand-primary/5 transition-all shadow-sm" />
                  </div>
                  <div className="space-y-3">
                      <label className="block text-[10px] font-black text-brand-clay uppercase tracking-[0.4em] ml-4">Flow Slot</label>
                      <select 
                        value={selectedSlot} 
                        onChange={(e) => setSelectedSlot(e.target.value as TimeSlot)}
                        className="w-full p-6 bg-white border-2 border-[#FFD1B3] rounded-[2rem] font-black text-brand-dark outline-none focus:ring-8 focus:ring-brand-primary/5 transition-all shadow-sm appearance-none"
                      >
                        {Object.values(TimeSlot).map(slot => (
                          <option key={slot} value={slot}>{slot} ({TIME_SLOT_CONFIG[slot].time})</option>
                        ))}
                      </select>
                  </div>
              </div>

              <div className="space-y-3 pb-12">
                 <label className="block text-[10px] font-black text-brand-clay uppercase tracking-[0.4em] ml-4">What were you doing?</label>
                 <textarea className="w-full p-8 rounded-[3rem] border-2 border-[#FFD1B3] outline-none text-brand-dark font-medium resize-none bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all shadow-sm min-h-[180px]" placeholder="Journal your activity..." value={activity} onChange={(e) => setActivity(e.target.value)} />
              </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-brand-bg/80 backdrop-blur-xl border-t border-[#FFD1B3] shrink-0">
        {step === 1 ? (
          <button onClick={() => setStep(2)} disabled={!selectedEmotion} className={`w-full py-5 rounded-[2rem] font-black text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 text-lg ${selectedEmotion ? 'bg-brand-primary shadow-2xl shadow-brand-primary/30 hover:bg-brand-secondary' : 'bg-slate-200 cursor-not-allowed text-slate-400 opacity-40'}`}>
            Next Step <ChevronRight size={24} strokeWidth={3} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="w-full py-5 rounded-[2rem] font-black text-white bg-brand-dark hover:bg-black shadow-2xl shadow-brand-dark/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 text-lg">
            <Save size={24} /> Save Entry
          </button>
        )}
      </div>
    </div>
  );
};

export default MoodForm;