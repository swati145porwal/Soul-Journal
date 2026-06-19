import { MoodEntry } from "../types";

const STORAGE_KEY = "mindfulmood_entries";

export const getEntries = (): MoodEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load entries", e);
    return [];
  }
};

export const saveEntry = (entry: MoodEntry): MoodEntry[] => {
  try {
    const current = getEntries();
    const index = current.findIndex(e => e.id === entry.id);
    
    let updated: MoodEntry[];
    
    if (index >= 0) {
      // Update existing
      updated = [...current];
      updated[index] = entry;
      // Sort by timestamp descending to keep history orderly
      updated.sort((a, b) => b.timestamp - a.timestamp);
    } else {
      // Create new (prepend)
      updated = [entry, ...current];
      // Sort ensuring new ones are at top usually, but strictly by time
      updated.sort((a, b) => b.timestamp - a.timestamp);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save entry", e);
    return [];
  }
};

export const deleteEntry = (id: string): MoodEntry[] => {
  try {
    const current = getEntries();
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to delete entry", e);
    return [];
  }
};

export const exportData = (): string => {
  const entries = getEntries();
  return JSON.stringify(entries, null, 2);
};

export const importData = (jsonString: string): MoodEntry[] => {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      // Basic validation check
      const isValid = parsed.every(item => item.id && item.timestamp && item.generalMood);
      if (isValid) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
    throw new Error("Invalid data format");
  } catch (e) {
    console.error("Failed to import data", e);
    throw e;
  }
};