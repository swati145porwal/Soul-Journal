import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { MoodEntry } from '../types';
import { MOOD_COLORS } from '../constants';

interface CalendarWidgetProps {
  entries: MoodEntry[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  onAddEntry?: (date: Date) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ entries, selectedDate, onSelectDate, onAddEntry }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
        setCurrentMonth(selectedDate);
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const getEntriesForDay = (day: number) => {
    const targetDateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
    return entries.filter(e => new Date(e.timestamp).toDateString() === targetDateStr);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth.getMonth() && 
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (day: number) => {
      const today = new Date();
      return today.getDate() === day &&
             today.getMonth() === currentMonth.getMonth() &&
             today.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-brand-dark/5 border border-brand-light">
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-3 bg-brand-bg hover:bg-brand-light rounded-2xl text-brand-dark transition-all">
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-xl font-black text-brand-dark lowercase tracking-tight">
            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextMonth} className="p-3 bg-brand-bg hover:bg-brand-light rounded-2xl text-brand-dark transition-all">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="text-[10px] font-black text-slate-300 py-2 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {padding.map(i => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dayEntries = getEntriesForDay(day);
            const selected = isSelected(day);
            const today = isToday(day);
            
            return (
              <button
                key={day}
                onClick={() => onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                className={`
                  h-12 w-full rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90
                  ${selected 
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                      : 'hover:bg-brand-bg text-brand-dark'}
                  ${today && !selected ? 'border-2 border-brand-primary/20 font-black' : ''}
                `}
              >
                <span className="text-sm font-black z-10">{day}</span>
                <div className="flex gap-0.5 mt-1 h-1">
                  {dayEntries.slice(0, 3).map((entry, idx) => (
                      <div 
                          key={idx} 
                          className={`w-1 h-1 rounded-full ${MOOD_COLORS[entry.generalMood]} ${selected ? 'bg-white' : ''}`}
                      ></div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && onAddEntry && (
        <button 
          onClick={() => onAddEntry(selectedDate)}
          className="w-full flex items-center justify-center gap-4 py-6 bg-brand-primary text-white rounded-[2.5rem] font-black shadow-2xl shadow-brand-primary/30 hover:bg-brand-secondary transition-all active:scale-[0.98] animate-in slide-in-from-top-4 duration-300"
        >
          <PlusCircle size={24} strokeWidth={3} />
          <span className="text-lg">Add Log for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </button>
      )}
    </div>
  );
};

export default CalendarWidget;
