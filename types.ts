export enum GeneralMood {
  GREAT = 'Great',
  GOOD = 'Good',
  FINE = 'Fine',
  BAD = 'Bad',
  AWFUL = 'Awful'
}

export enum TimeSlot {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night'
}

export interface EmotionNode {
  name: string;
  color?: string;
  children?: EmotionNode[];
  value?: number; // Needed for D3 hierarchy
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  dateStr: string; // ISO String for grouping
  timeSlot: TimeSlot; // Morning, Afternoon, etc.
  generalMood: GeneralMood;
  specificEmotions: string[]; // Selected from wheel
  activity: string; // "What were you doing?"
}

export type ViewState = 'HOME' | 'LOG' | 'HISTORY' | 'INSIGHTS' | 'PROFILE';