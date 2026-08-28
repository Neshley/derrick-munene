export interface SongbookSection {
  id: string;
  name: string;
  chords: string[];
  lyrics: string;
  suggestedArrangerSection: string; // 'main_a' | 'main_b' | 'main_c' | 'main_d' | 'intro_a' | 'ending_a'
}

export interface SongbookEntry {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  timeSignature: string;
  category: string;
  recommendedStyleId: string;
  progression: string[];
  sections: SongbookSection[];
  notes?: string;
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface Setbook {
  id: string;
  name: string;
  description?: string;
  serviceDate?: string;
  color?: string; // 'amber' | 'cyan' | 'emerald' | 'purple' | 'rose' | 'indigo'
  songIds: string[];
  createdAt: number;
  updatedAt: number;
  isDefault?: boolean;
}

export interface SongbookData {
  songs: SongbookEntry[];
  setbooks: Setbook[];
  activeSetbookId: string | null;
}
