import { EmotionNode, GeneralMood, TimeSlot } from './types';

export const CORE_COLORS = {
  anger: "#FFEBEE",    // Soft Red
  sadness: "#E8EAF6",  // Soft Blue
  surprise: "#E0F7FA", // Soft Cyan
  joy: "#F1F8E9",      // Soft Green
  love: "#FFFDE7",     // Soft Yellow
  fear: "#FFF3E0",     // Soft Orange
};

export const TIME_SLOT_CONFIG = {
  [TimeSlot.MORNING]: { time: '09:00 AM', hour: 9 },
  [TimeSlot.AFTERNOON]: { time: '02:00 PM', hour: 14 },
  [TimeSlot.EVENING]: { time: '06:00 PM', hour: 18 },
  [TimeSlot.NIGHT]: { time: '09:00 PM', hour: 21 },
};

export const PRESELECTED_AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=ffdfbf",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka&backgroundColor=ffd5dc",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Buddy&backgroundColor=d1fae5",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Ginger&backgroundColor=fef3c7",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe&backgroundColor=dbeafe",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Midnight&backgroundColor=ede9fe"
];

export const EMOTION_TO_MOOD_MAP: Record<string, GeneralMood> = {
  "Anger": GeneralMood.AWFUL,
  "Sadness": GeneralMood.BAD,
  "Surprise": GeneralMood.GOOD,
  "Joy": GeneralMood.GREAT,
  "Love": GeneralMood.GREAT,
  "Fear": GeneralMood.BAD
};

export const EMOTION_WHEEL_DATA: EmotionNode = {
  name: "Soul",
  children: [
    {
      name: "Joy",
      color: "#AED581",
      children: [
        { name: "Enthralled", children: [{ name: "Enchanted" }, { name: "Rapture" }] },
        { name: "Elation", children: [{ name: "Euphoric" }, { name: "Jubilation" }] },
        { name: "Enthusiastic", children: [{ name: "Excited" }, { name: "Zeal" }] },
        { name: "Optimistic", children: [{ name: "Eager" }, { name: "Hopeful" }] },
        { name: "Proud", children: [{ name: "Triumphant" }, { name: "Illustrious" }] },
        { name: "Cheerful", children: [{ name: "Jovial" }, { name: "Blissful" }] },
        { name: "Happy", children: [{ name: "Amused" }, { name: "Delighted" }] },
        { name: "Content", children: [{ name: "Pleased" }, { name: "Satisfied" }] }
      ]
    },
    {
      name: "Love",
      color: "#FFF176",
      children: [
        { name: "Peaceful", children: [{ name: "Satisfied" }, { name: "Relieved" }] },
        { name: "Affectionate", children: [{ name: "Fondness" }, { name: "Sentimental" }] },
        { name: "Longing", children: [{ name: "Attracted" }, { name: "Sentimental" }] },
        { name: "Desire", children: [{ name: "Infatuation" }, { name: "Passion" }] },
        { name: "Tenderness", children: [{ name: "Compassionate" }, { name: "Caring" }] }
      ]
    },
    {
      name: "Fear",
      color: "#FFB74D",
      children: [
        { name: "Scared", children: [{ name: "Frightened" }, { name: "Helpless" }] },
        { name: "Terror", children: [{ name: "Panic" }, { name: "Hysterical" }] },
        { name: "Insecure", children: [{ name: "Inferior" }, { name: "Inadequate" }] },
        { name: "Nervous", children: [{ name: "Worried" }, { name: "Anxious" }] },
        { name: "Horror", children: [{ name: "Mortified" }, { name: "Dread" }] }
      ]
    },
    {
      name: "Surprise",
      color: "#4FC3F7",
      children: [
        { name: "Stunned", children: [{ name: "Shocked" }, { name: "Dismayed" }] },
        { name: "Confused", children: [{ name: "Disillusioned" }, { name: "Perplexed" }] },
        { name: "Amazed", children: [{ name: "Astonished" }, { name: "Awe-struck" }] },
        { name: "Overcome", children: [{ name: "Speechless" }, { name: "Astounded" }] },
        { name: "Moved", children: [{ name: "Stimulated" }, { name: "Touched" }] }
      ]
    },
    {
      name: "Sadness",
      color: "#9575CD",
      children: [
        { name: "Suffering", children: [{ name: "Agony" }, { name: "Hurt" }] },
        { name: "Sadness", children: [{ name: "Depressed" }, { name: "Sorrow" }] },
        { name: "Disappointed", children: [{ name: "Dismayed" }, { name: "Displeased" }] },
        { name: "Shameful", children: [{ name: "Regretful" }, { name: "Guilty" }] },
        { name: "Neglected", children: [{ name: "Isolated" }, { name: "Lonely" }] },
        { name: "Despair", children: [{ name: "Grief" }, { name: "Powerless" }] }
      ]
    },
    {
      name: "Anger",
      color: "#F06292", 
      children: [
        { name: "Exasperated", children: [{ name: "Irritable" }, { name: "Envy" }] },
        { name: "Irritable", children: [{ name: "Aggravated" }, { name: "Annoyed" }] },
        { name: "Envy", children: [{ name: "Resentful" }, { name: "Jealous" }] },
        { name: "Disgust", children: [{ name: "Contempt" }, { name: "Revolted" }] },
        { name: "Rage", children: [{ name: "Hate" }, { name: "Hostile" }] }
      ]
    }
  ]
};

export const MOOD_SCALE = {
  [GeneralMood.GREAT]: 5,
  [GeneralMood.GOOD]: 4,
  [GeneralMood.FINE]: 3,
  [GeneralMood.BAD]: 2,
  [GeneralMood.AWFUL]: 1,
};

export const MOOD_COLORS = {
  [GeneralMood.GREAT]: 'bg-emerald-500',
  [GeneralMood.GOOD]: 'bg-cyan-500',
  [GeneralMood.FINE]: 'bg-amber-400',
  [GeneralMood.BAD]: 'bg-orange-500',
  [GeneralMood.AWFUL]: 'bg-rose-500',
};