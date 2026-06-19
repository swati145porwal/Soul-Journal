
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, MoodEntry, GeneralMood, TimeSlot } from './types';
import * as storage from './services/storageService';
import MoodForm from './components/MoodForm';
import EntryList from './components/EntryList';
import Dashboard from './components/Dashboard';
import CalendarWidget from './components/CalendarWidget';
import JournalView from './components/JournalView';
import { PRESELECTED_AVATARS, TIME_SLOT_CONFIG, MOOD_SCALE } from './constants';
import { PlusCircle, ChartColumn, ArrowLeft, X, Download, CloudUpload, Calendar as CalendarIcon, Home, User, ChevronRight, Camera, Sparkles, BellRing, Trash2, Eye, BookHeart } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [profilePic, setProfilePic] = useState(localStorage.getItem('soul_avatar') || PRESELECTED_AVATARS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Slot notification
  const [activeNotification, setActiveNotification] = useState<TimeSlot | null>(null);
  const [forcePreviewNotification, setForcePreviewNotification] = useState(false);

  // Undo Logic State
  const [lastDeletedEntry, setLastDeletedEntry] = useState<MoodEntry | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and Persist
  useEffect(() => {
    const savedEntries = storage.getEntries();
    setEntries(savedEntries);
  }, []);

  // Notification Polling
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];
      
      let targetSlot: TimeSlot | null = null;
      if (currentHour >= 9 && currentHour < 14) targetSlot = TimeSlot.MORNING;
      else if (currentHour >= 14 && currentHour < 18) targetSlot = TimeSlot.AFTERNOON;
      else if (currentHour >= 18 && currentHour < 21) targetSlot = TimeSlot.EVENING;
      else if (currentHour >= 21) targetSlot = TimeSlot.NIGHT;

      if (targetSlot) {
        const alreadyLogged = entries.some(e => e.dateStr === todayStr && e.timeSlot === targetSlot);
        if (!alreadyLogged) {
          setActiveNotification(targetSlot);
        } else {
          setActiveNotification(null);
        }
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); 
    return () => clearInterval(interval);
  }, [entries]);

  const handleSaveEntry = (mood: GeneralMood, emotions: string[], activity: string, slot: TimeSlot, dateObj: Date, id?: string) => {
    const newEntry: MoodEntry = {
      id: id || Date.now().toString(),
      timestamp: dateObj.getTime(),
      dateStr: dateObj.toISOString().split('T')[0],
      timeSlot: slot,
      generalMood: mood,
      specificEmotions: emotions,
      activity
    };
    const updated = storage.saveEntry(newEntry);
    setEntries(updated);
    setEditingEntry(null);
    setView('HISTORY');
    setActiveNotification(null);
    setForcePreviewNotification(false);
  };

  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    if (entryToDelete) {
      const updated = storage.deleteEntry(id);
      setEntries(updated);
      setLastDeletedEntry(entryToDelete);
      setShowUndo(true);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = setTimeout(() => {
        setShowUndo(false);
        setLastDeletedEntry(null);
      }, 5000);
    }
  };

  const handleUndoDelete = () => {
    if (lastDeletedEntry) {
      const updated = storage.saveEntry(lastDeletedEntry);
      setEntries(updated);
      setLastDeletedEntry(null);
      setShowUndo(false);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    }
  };

  const handleUpdateAvatar = (url: string) => {
      setProfilePic(url);
      localStorage.setItem('soul_avatar', url);
      setShowAvatarPicker(false);
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soul-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = storage.importData(content);
        setEntries(imported);
        alert("History restored successfully.");
      } catch (err) {
        alert("Failed to import. Please use a valid Soul backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem("mindfulmood_entries");
      setEntries([]);
      alert("All data cleared.");
    }
  };

  const displayedEntries = entries.filter(e => e.dateStr === selectedDate.toISOString().split('T')[0]);

  const renderContent = () => {
    switch (view) {
      case 'LOG':
        return <MoodForm initialData={editingEntry} initialDate={selectedDate} initialSlot={activeNotification || (forcePreviewNotification ? TimeSlot.MORNING : null)} onSave={handleSaveEntry} onCancel={() => {setEditingEntry(null); setView('HOME');}} />;
      case 'HISTORY':
        return (
            <div className="pt-2 space-y-6 animate-slide-up">
                <h2 className="text-4xl font-display font-black text-brand-dark px-1 tracking-tighter">Journey</h2>
                <CalendarWidget 
                    entries={entries} 
                    selectedDate={selectedDate} 
                    onSelectDate={(d) => d && setSelectedDate(d)} 
                />
                <div className="pt-4">
                    <div className="flex justify-between items-baseline mb-6 px-1">
                        <h3 className="text-[10px] font-black text-brand-clay uppercase tracking-[0.3em] opacity-60">Flow Journal</h3>
                        <span className="text-brand-dark font-bold text-sm">{selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric'})}</span>
                    </div>
                    <JournalView 
                      date={selectedDate}
                      entries={displayedEntries}
                      onAddEntry={(slot) => {
                        setSelectedDate(selectedDate);
                        setEditingEntry(null);
                        setView('LOG');
                      }}
                      onEditEntry={(entry) => {
                        setEditingEntry(entry);
                        setView('LOG');
                      }}
                    />
                </div>
            </div>
        );
      case 'INSIGHTS':
        return (
          <div className="pt-2 animate-slide-up">
            <h2 className="text-4xl font-display font-black text-brand-dark mb-8 px-1 tracking-tighter">Reflections</h2>
            <Dashboard entries={entries} />
          </div>
        );
      case 'PROFILE':
        return (
            <div className="pt-2 space-y-8 animate-slide-up">
               <div className="flex justify-between items-center px-1">
                  <h2 className="text-4xl font-display font-black text-brand-dark tracking-tighter">Identity</h2>
                  <button 
                    onClick={() => { setForcePreviewNotification(!forcePreviewNotification); setView('HOME'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-soft text-brand-clay rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-light transition-colors"
                  >
                    <Eye size={14} /> {forcePreviewNotification ? "Hide Preview" : "Preview Notify"}
                  </button>
               </div>

               <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-brand-light flex flex-col items-center text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-32 bg-brand-soft opacity-60 transition-all group-hover:h-36"></div>
                  <div className="relative mt-2">
                      <div className="w-40 h-40 rounded-full bg-white mb-6 border-8 border-white shadow-2xl overflow-hidden ring-4 ring-brand-primary/5">
                         <img src={profilePic} alt="Profile" className="w-full h-full object-cover scale-110" />
                      </div>
                      <button 
                        onClick={() => setShowAvatarPicker(true)}
                        className="absolute bottom-10 right-2 p-3.5 bg-brand-primary text-white rounded-2xl shadow-xl border-4 border-white hover:bg-brand-secondary transition-all active:scale-90"
                      >
                        <Camera size={20} />
                      </button>
                  </div>
                  <h3 className="text-3xl font-display font-black text-brand-dark tracking-tighter">Soul Guardian</h3>
                  <p className="text-brand-clay font-bold text-sm tracking-wide mt-2 opacity-40 uppercase tracking-[0.2em]">Flowing since {entries.length > 0 ? new Date(entries[entries.length-1].timestamp).getFullYear() : 'today'}</p>
               </div>
               
               {showAvatarPicker && (
                   <div className="p-10 bg-white rounded-[3rem] border-2 border-brand-light shadow-2xl animate-in zoom-in-95 duration-200">
                       <h4 className="text-[10px] font-black text-brand-clay mb-8 uppercase tracking-[0.4em] text-center opacity-60">Aspect Selection</h4>
                       <div className="grid grid-cols-3 gap-6">
                           {PRESELECTED_AVATARS.map((url, i) => (
                               <button 
                                key={i} 
                                onClick={() => handleUpdateAvatar(url)}
                                className={`rounded-3xl overflow-hidden border-4 transition-all ${profilePic === url ? 'border-brand-primary scale-110 shadow-2xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                               >
                                   <img src={url} alt={`Avatar ${i}`} className="w-full h-full" />
                               </button>
                           ))}
                       </div>
                   </div>
               )}

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-brand-light flex flex-col items-center shadow-sm">
                     <span className="text-brand-clay text-[9px] uppercase font-black tracking-[0.3em] mb-2 opacity-50">Total Check-ins</span>
                     <span className="text-5xl font-display font-black text-brand-dark tracking-tighter">{entries.length}</span>
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] border border-brand-light flex flex-col items-center shadow-sm">
                     <span className="text-brand-clay text-[9px] uppercase font-black tracking-[0.3em] mb-2 opacity-50">Active Days</span>
                     <span className="text-5xl font-display font-black text-brand-dark tracking-tighter">{new Set(entries.map(e => e.dateStr)).size}</span>
                  </div>
               </div>

               <div className="space-y-4 pb-32">
                  <div className="text-[10px] font-black text-brand-clay uppercase tracking-[0.4em] ml-4 mb-2 opacity-60">Storage & Backup</div>
                  
                  <button onClick={handleExport} className="w-full flex items-center justify-between p-6 bg-white rounded-[2rem] border border-brand-light hover:bg-brand-soft transition-all active:scale-[0.98]">
                     <span className="flex items-center gap-5 font-black text-brand-dark tracking-tight">
                        <div className="p-3 bg-brand-soft text-brand-primary rounded-2xl"><Download size={22}/></div> Download Backup
                     </span>
                     <ChevronRight size={20} className="text-slate-200" />
                  </button>

                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-6 bg-white rounded-[2rem] border border-brand-light hover:bg-brand-soft transition-all active:scale-[0.98]">
                     <span className="flex items-center gap-5 font-black text-brand-dark tracking-tight">
                        <div className="p-3 bg-brand-soft text-brand-primary rounded-2xl"><CloudUpload size={22}/></div> Import Data
                     </span>
                     <ChevronRight size={20} className="text-slate-200" />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />

                  <button onClick={handleClearAll} className="w-full flex items-center justify-between p-6 bg-rose-50 rounded-[2rem] border border-rose-100 hover:bg-rose-100 transition-all active:scale-[0.98]">
                     <span className="flex items-center gap-5 font-black text-rose-600 tracking-tight">
                        <div className="p-3 bg-white text-rose-500 rounded-2xl"><Trash2 size={22}/></div> Clear All Data
                     </span>
                     <ChevronRight size={20} className="text-rose-200" />
                  </button>
               </div>
            </div>
        );
      case 'HOME':
      default:
        const showNotif = activeNotification || (forcePreviewNotification ? TimeSlot.MORNING : null);
        return (
          <div className="space-y-12 pt-4 animate-fade-in">
             {showNotif && (
               <div className="bg-brand-dark text-white p-8 rounded-[3.5rem] flex items-center justify-between shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] animate-bounce-short border-4 border-brand-primary/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-brand-accent text-brand-dark rounded-[1.8rem] shadow-xl ring-4 ring-brand-accent/20">
                      <BellRing size={26} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent/70 mb-1.5">Journal Prompt</p>
                      <h4 className="font-display font-black text-2xl tracking-tighter leading-none">{showNotif} Entry</h4>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEditingEntry(null); setSelectedDate(new Date()); setView('LOG'); }}
                    className="bg-brand-primary text-white px-8 py-3.5 rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-secondary transition-all active:scale-95 shadow-lg shadow-brand-primary/30"
                  >
                    Write
                  </button>
               </div>
             )}

             {/* Hero Scenic Card */}
             <div className="rounded-[3.5rem] p-1 text-white relative overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,0.4)] animate-float group bg-brand-dark">
                {/* Scenic Background Picture */}
                <div 
                  className="absolute inset-0 opacity-60 mix-blend-overlay scale-110 group-hover:scale-100 transition-transform duration-[10s] ease-out pointer-events-none"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-transparent to-brand-primary/20 pointer-events-none"></div>
                
                <div className="relative z-10 p-11">
                    <div className="flex items-center gap-2 mb-4">
                        <BookHeart size={24} className="text-brand-accent" strokeWidth={3} />
                        <span className="text-brand-accent font-black uppercase text-[10px] tracking-[0.5em]">Emotional Journal</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <h1 className="text-7xl font-display font-black tracking-tighter leading-none drop-shadow-lg">Soul</h1>
                        <div className="w-3 h-3 bg-brand-primary rounded-full shadow-[0_0_15px_#D97706]"></div>
                    </div>
                    <p className="text-brand-light font-medium text-xl italic leading-relaxed max-w-[240px] mb-12 drop-shadow-md">Map the subtle ripples of your heart.</p>
                    <button onClick={() => { setEditingEntry(null); setSelectedDate(new Date()); setView('LOG'); }} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-6 rounded-[2rem] font-black shadow-2xl hover:bg-white/20 transition-all flex items-center gap-4 text-2xl active:scale-95 ring-1 ring-white/30">
                        <PlusCircle size={32} strokeWidth={3} /> New Entry
                    </button>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-end px-3">
                    <h2 className="text-2xl font-display font-black text-brand-dark tracking-tighter">Recent Entries</h2>
                    <button onClick={() => setView('HISTORY')} className="text-[10px] text-brand-clay font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity">Journal</button>
                </div>
                <EntryList 
                  entries={entries.slice(0, 3)} 
                  onDelete={handleDeleteEntry} 
                  onEdit={(e) => {setEditingEntry(e); setView('LOG');}} 
                  onUndo={handleUndoDelete}
                  showUndo={showUndo}
                />
             </div>
          </div>
        );
    }
  };

  return (
    <div className="h-[100dvh] bg-brand-bg max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col relative font-sans selection:bg-brand-primary selection:text-white">
      {/* Top Glass Header */}
      <div className="px-10 pt-16 pb-6 z-10 shrink-0">
         <div className="flex justify-between items-center">
            {view !== 'HOME' ? (
                <button onClick={() => setView('HOME')} className="p-4 -ml-4 rounded-3xl hover:bg-brand-soft text-brand-dark transition-all active:scale-90">
                    <ArrowLeft size={32} strokeWidth={2.5} />
                </button>
            ) : (
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">
                        <BookHeart size={20} className="text-white" strokeWidth={3} />
                    </div>
                    <div className="text-brand-primary font-display font-black text-4xl tracking-tighter leading-none">Soul</div>
                </div>
            )}
            <button onClick={() => setView('PROFILE')} className="w-14 h-14 rounded-[1.5rem] bg-white overflow-hidden border-2 border-white shadow-xl hover:ring-[10px] hover:ring-brand-primary/5 transition-all active:scale-90">
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover scale-110" />
            </button>
         </div>
      </div>

      <main className="flex-1 px-10 pb-40 overflow-y-auto no-scrollbar">
        {renderContent()}
      </main>

      {/* Elegant Tab Bar */}
      {view !== 'LOG' && (
        <nav className="absolute bottom-10 left-10 right-10 glass border border-white/50 rounded-[3rem] shadow-2xl shadow-brand-dark/10 p-3.5 z-50">
            <div className="flex justify-between items-center px-6">
                <button onClick={() => setView('HOME')} className={`p-4 rounded-[1.5rem] transition-all active:scale-90 ${view === 'HOME' ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'text-slate-300 hover:text-brand-clay'}`}>
                    <Home size={28} strokeWidth={view === 'HOME' ? 3 : 2} />
                </button>
                <button onClick={() => setView('HISTORY')} className={`p-4 rounded-[1.5rem] transition-all active:scale-90 ${view === 'HISTORY' ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'text-slate-300 hover:text-brand-clay'}`}>
                    <CalendarIcon size={28} strokeWidth={view === 'HISTORY' ? 3 : 2} />
                </button>
                <button onClick={() => setView('INSIGHTS')} className={`p-4 rounded-[1.5rem] transition-all active:scale-90 ${view === 'INSIGHTS' ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'text-slate-300 hover:text-brand-clay'}`}>
                    <ChartColumn size={28} strokeWidth={view === 'INSIGHTS' ? 3 : 2} />
                </button>
                <button onClick={() => setView('PROFILE')} className={`p-4 rounded-[1.5rem] transition-all active:scale-90 ${view === 'PROFILE' ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/20' : 'text-slate-300 hover:text-brand-clay'}`}>
                    <User size={28} strokeWidth={view === 'PROFILE' ? 3 : 2} />
                </button>
            </div>
        </nav>
      )}
    </div>
  );
};

export default App;
