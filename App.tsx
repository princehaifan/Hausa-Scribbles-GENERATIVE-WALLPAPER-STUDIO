import React, { useState, useMemo } from 'react';
import { Download, Grid3x3, Smartphone, Monitor, Tablet, Palette, Layers } from 'lucide-react';
import { AspectRatio, Wallpaper } from './types';
import { WallpaperCard } from './components/WallpaperCard';
import { drawPattern } from './utils/patternGenerator';

const App: React.FC = () => {
  // Constants
  const WALLPAPER_COUNT = 240;
  
  const RATIOS: AspectRatio[] = [
    { id: '9:16', name: 'Phone', label: '9:16', icon: Smartphone, width: 1080, height: 1920 },
    { id: '16:9', name: 'Desktop', label: '16:9', icon: Monitor, width: 1920, height: 1080 },
    { id: '4:3', name: 'Tablet', label: '4:3', icon: Tablet, width: 2048, height: 1536 },
    { id: '1:1', name: 'Square', label: '1:1', icon: Grid3x3, width: 1080, height: 1080 },
  ];

  // State
  const [selectedRatioId, setSelectedRatioId] = useState<string>('9:16');
  const [selectedWallpaperIds, setSelectedWallpaperIds] = useState<Set<number>>(new Set());
  const [density, setDensity] = useState<number>(1.0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Derived State
  const currentRatio = useMemo(() => 
    RATIOS.find(r => r.id === selectedRatioId) || RATIOS[0], 
    [selectedRatioId]
  );

  const wallpapers: Wallpaper[] = useMemo(() => 
    Array.from({ length: WALLPAPER_COUNT }, (_, i) => ({
      id: i + 1,
      seed: i * 1337 + 42, // Deterministic seed
    })),
    []
  );

  // Handlers
  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedWallpaperIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedWallpaperIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedWallpaperIds.size === wallpapers.length) {
      setSelectedWallpaperIds(new Set());
    } else {
      setSelectedWallpaperIds(new Set(wallpapers.map(w => w.id)));
    }
  };

  const generateAndDownload = async (wallpaper: Wallpaper) => {
    return new Promise<void>((resolve) => {
      // Create an offscreen canvas for high-res generation
      const canvas = document.createElement('canvas');
      canvas.width = currentRatio.width;
      canvas.height = currentRatio.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        drawPattern(ctx, currentRatio.width, currentRatio.height, wallpaper.seed, density);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hausa-scribble-${wallpaper.id}-${currentRatio.name.toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
          resolve();
        }, 'image/png');
      } else {
        resolve();
      }
    });
  };

  const handleDownloadSingle = (wallpaper: Wallpaper) => {
    generateAndDownload(wallpaper);
  };

  const handleBulkDownload = async () => {
    setIsDownloading(true);
    const selected = wallpapers.filter(w => selectedWallpaperIds.has(w.id));
    
    // Process sequentially to avoid freezing browser
    for (const wallpaper of selected) {
      await generateAndDownload(wallpaper);
      await new Promise(r => setTimeout(r, 200)); // Small delay to be nice to the browser
    }
    setIsDownloading(false);
    setSelectedWallpaperIds(new Set()); // Optional: clear selection after download
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Logo Area */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white">
                <Palette size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Hausa Scribbles</h1>
                <p className="text-xs text-gray-500 font-medium">GENERATIVE WALLPAPER STUDIO</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-6">
              {/* Ratio Selectors */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                {RATIOS.map((ratio) => {
                  const Icon = ratio.icon;
                  const isActive = selectedRatioId === ratio.id;
                  return (
                    <button
                      key={ratio.id}
                      onClick={() => setSelectedRatioId(ratio.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={`${ratio.width}x${ratio.height}`}
                    >
                      <Icon size={16} />
                      <span className="hidden sm:inline">{ratio.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Density Slider */}
              <div className="flex flex-col justify-center min-w-[140px]">
                <label className="text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
                    <span>Density</span>
                    <span className="font-mono text-indigo-600">{density.toFixed(1)}x</span>
                </label>
                <input
                    type="range"
                    min="0.2"
                    max="3.0"
                    step="0.1"
                    value={density}
                    onChange={(e) => setDensity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 border-l pl-3 border-gray-200">
               <button
                onClick={handleSelectAll}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-2 py-1"
              >
                {selectedWallpaperIds.size === wallpapers.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <button
                onClick={handleBulkDownload}
                disabled={selectedWallpaperIds.size === 0 || isDownloading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all ${
                  selectedWallpaperIds.size > 0 && !isDownloading
                    ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg translate-y-0'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {isDownloading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Download size={18} />
                    Download {selectedWallpaperIds.size > 0 ? `(${selectedWallpaperIds.size})` : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats / Info Bar */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Layers size={16} />
            <span>Displaying {wallpapers.length} generated variations</span>
          </div>
          <div>
            Resolution: <span className="font-mono font-medium text-gray-700">{currentRatio.width} × {currentRatio.height}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wallpapers.map((wallpaper) => (
            <WallpaperCard
              key={wallpaper.id}
              wallpaper={wallpaper}
              ratio={currentRatio}
              density={density}
              isSelected={selectedWallpaperIds.has(wallpaper.id)}
              onToggleSelect={toggleSelection}
              onDownload={handleDownloadSingle}
            />
          ))}
        </div>
      </main>

       {/* Footer */}
       <footer className="bg-white border-t border-gray-200 py-8 mt-12">
         <div className="max-w-7xl mx-auto px-4 text-center">
           <p className="text-gray-500 text-sm">
             Hausa Scribbles &copy; {new Date().getFullYear()}. Built with React & HTML5 Canvas.
           </p>
           <p className="text-xs text-gray-400 mt-2">
             Patterns are procedurally generated on your device.
           </p>
         </div>
       </footer>
    </div>
  );
};

export default App;