import { LucideIcon } from 'lucide-react';

export interface AspectRatio {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  width: number;
  height: number;
}

export interface Wallpaper {
  id: number;
  seed: number;
}

export interface PatternConfig {
  colors: string[];
  motifs: string[];
}