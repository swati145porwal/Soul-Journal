import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { MoodEntry, TimeSlot } from '../types';
import { MOOD_SCALE, CORE_COLORS, MOOD_COLORS } from '../constants';

interface DashboardProps {
  entries: MoodEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 border border-brand-light rounded-2xl shadow-xl">
        <p className="text-[10px] font-black text-brand-clay uppercase tracking-widest mb-1">{label}</p>
        <p className="text-lg font-black text-brand-dark leading-none">{payload[0].value.toFixed(1)} Flow</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="font-medium italic">Your soul chart awaits its first entry...</p>
      </div>
    );
  }

  // 1. Process data for Trend Line (Mood Score over time)
  const lineData = [...entries]
    .sort((a, b) => a.timestamp - b.timestamp) 
    .map(e => ({
      date: new Date(e.timestamp).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
      score: MOOD_SCALE[e.generalMood]
    }));

  // 2. Emotion Distribution
  const categoryCounts: Record<string, number> = {};
  entries.forEach(e => {
      let category = "Spirit";
      const mood = e.generalMood;
      if (mood === 'Great') category = "Joy";
      else if (mood === 'Good') category = "Love";
      else if (mood === 'Fine') category = "Surprise";
      else if (mood === 'Bad') category = "Sadness";
      else if (mood === 'Awful') category = "Anger";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const PIE_COLORS: Record<string, string> = {
      "Joy": "#AED581",
      "Love": "#FFF176",
      "Surprise": "#4FC3F7",
      "Sadness": "#9575CD",
      "Anger": "#F06292",
      "Spirit": "#ccc"
  };

  // 3. Mood by Time Slot
  const slotData = Object.values(TimeSlot).map(slot => {
    const slotEntries = entries.filter(e => e.timeSlot === slot);
    const avg = slotEntries.length > 0 
      ? slotEntries.reduce((acc, curr) => acc + MOOD_SCALE[curr.generalMood], 0) / slotEntries.length
      : 0;
    return { name: slot, avg };
  });

  const averageScore = lineData.length > 0 
    ? (lineData.reduce((acc, curr) => acc + curr.score, 0) / lineData.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
      
      {/* Hero Summary Card */}
      <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -mr-20 -mt-20 blur-[80px] group-hover:blur-[100px] transition-all duration-700"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse"></div>
            <span className="text-brand-accent font-black uppercase text-[10px] tracking-[0.4em]">Spirit Index</span>
          </div>
          <div className="flex items-baseline gap-3">
              <span className="text-6xl font-display font-black tracking-tighter">{averageScore}</span>
              <span className="text-xl font-medium opacity-40">/ 5.0</span>
          </div>
          <p className="text-brand-light/60 text-sm font-medium leading-relaxed max-w-[200px]">
              Average flow across {entries.length} reflections.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-brand-light transition-all hover:shadow-md">
          <div className="flex justify-between items-start mb-8">
            <h3 className="font-display font-black text-brand-dark text-lg lowercase tracking-tight">Emotional Wave</h3>
            <span className="text-[9px] font-black text-brand-clay/40 uppercase tracking-widest">Recent Trends</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} 
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                />
                <YAxis hide domain={[1, 5]} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#D97706" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorMood)"
                  animationBegin={200}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mood by Time of Day */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-brand-light">
          <h3 className="font-display font-black text-brand-dark text-lg lowercase tracking-tight mb-6">Daily Flow Rhythms</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slotData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                <XAxis 
                  dataKey="name" 
                  tick={{fontSize: 9, fill: '#64748b', fontWeight: 800, textTransform: 'uppercase'}} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis hide domain={[0, 5]} />
                <Tooltip cursor={{fill: '#F1F5F9', radius: 10}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="avg" 
                  fill="#D97706" 
                  radius={[12, 12, 4, 4]} 
                  barSize={32}
                  animationDuration={2000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-brand-light flex flex-col items-center">
          <div className="w-full text-left mb-4">
             <h3 className="font-display font-black text-brand-dark text-lg lowercase tracking-tight">Spirit Mix</h3>
          </div>
          <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#CBD5E1'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle" 
                        formatter={(val) => <span className="text-[10px] font-black text-brand-clay uppercase tracking-widest ml-1">{val}</span>}
                      />
                  </PieChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;