import React, { useRef, useEffect, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Wallpaper, AspectRatio } from '../types';
import { drawPattern } from '../utils/patternGenerator';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  ratio: AspectRatio;
  density: number;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDownload: (wallpaper: Wallpaper) => void;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  ratio,
  density,
  isSelected,
  onToggleSelect,
  onDownload,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate preview dimensions (scaled down to width 300px max)
  const previewWidth = 300;
  const previewHeight = Math.round(previewWidth * (ratio.height / ratio.width));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the pattern
    drawPattern(ctx, previewWidth, previewHeight, wallpaper.seed, density);
  }, [wallpaper.seed, ratio.id, previewWidth, previewHeight, density]);

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform ${
        isSelected ? 'ring-4 ring-indigo-500 scale-[1.02]' : 'hover:scale-[1.01]'
      } overflow-hidden flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Indicator */}
      <div 
        onClick={() => onToggleSelect(wallpaper.id)}
        className="absolute top-3 right-3 z-10 cursor-pointer"
      >
         <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
           isSelected 
             ? 'bg-indigo-600 text-white scale-100' 
             : 'bg-white/80 text-transparent hover:bg-white scale-90 hover:scale-100'
         }`}>
           <Check size={18} strokeWidth={3} />
         </div>
      </div>

      {/* Canvas Container */}
      <div 
        className="relative w-full bg-gray-100 cursor-pointer"
        style={{ aspectRatio: `${ratio.width}/${ratio.height}` }}
        onClick={() => onToggleSelect(wallpaper.id)}
      >
        <canvas
          ref={canvasRef}
          width={previewWidth}
          height={previewHeight}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay for hover effect */}
        <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
          isHovered && !isSelected ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-100 flex justify-between items-center bg-white">
        <span className="text-xs font-mono text-gray-400">#{wallpaper.id.toString().padStart(3, '0')}</span>
        
        <div className="flex gap-2">
            <button
            onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(wallpaper.id);
            }}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                isSelected 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            >
            {isSelected ? 'Selected' : 'Select'}
            </button>
            <button
            onClick={(e) => {
                e.stopPropagation();
                onDownload(wallpaper);
            }}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Download High Res"
            >
            <Download size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};