import React, { useState, useEffect, useRef } from 'react';
import { Layers, History } from 'lucide-react';

interface HeaderNavigationProps {
  activeTab: 'designer' | 'cover-letter' | 'id-card' | 'noc' | 'seal';
  onTabChange: (tab: 'designer' | 'cover-letter' | 'id-card' | 'noc' | 'seal') => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenHistory,
  historyCount = 0,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop);
      
      // Calculate top 3% threshold or 60px (whichever is larger for long pages)
      const maxScrollable = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      const topThreshold = Math.max(60, maxScrollable * 0.03); // 97% scrolled back to top

      // Only show menu when close to the top (<= topThreshold)
      if (currentScrollY <= topThreshold) {
        setIsVisible(true);
      } else {
        // Hide menu when scrolled down past top threshold
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      onMouseEnter={() => setIsVisible(true)}
      className={`sticky top-0 z-40 px-3 sm:px-6 py-2 sm:py-2.5 border-b backdrop-blur-md shadow-2xs print:hidden bg-white/95 border-neutral-200 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-2.5">
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-neutral-900 m-0 leading-none">
                PadGen
              </h1>
            </div>
          </div>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="sm:hidden px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer border-b-2 border-orange-700 shrink-0"
            >
              <History className="w-3.5 h-3.5 text-white" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {historyCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* TAB CONTROL TOGGLES */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-2.5">
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center p-1 rounded-[10px] bg-neutral-100 border border-neutral-200 gap-1.5 w-full sm:w-auto">
              {/* Row 1 on Mobile: Pad & Card, Cover Letter */}
              <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => onTabChange('designer')}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-[10px] text-xs text-center transition-all duration-150 cursor-pointer ${
                    activeTab === 'designer'
                      ? 'bg-emerald-600 text-white border-b-4 border-black/30 shadow-md font-black ring-2 ring-emerald-400 ring-offset-1'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                  }`}
                >
                  Pad & Card
                </button>
                <button
                  onClick={() => onTabChange('cover-letter')}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-[10px] text-xs text-center transition-all duration-150 cursor-pointer ${
                    activeTab === 'cover-letter'
                      ? 'bg-indigo-600 text-white border-b-4 border-black/30 shadow-md font-black ring-2 ring-indigo-400 ring-offset-1'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                  }`}
                >
                  Cover Letter
                </button>
              </div>

              {/* Row 2 on Mobile: Job ID, Seal, NOC */}
              <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => onTabChange('id-card')}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-[10px] text-xs text-center transition-all duration-150 cursor-pointer ${
                    activeTab === 'id-card'
                      ? 'bg-teal-600 text-white border-b-4 border-black/30 shadow-md font-black ring-2 ring-teal-400 ring-offset-1'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                  }`}
                >
                  Job ID
                </button>
                <button
                  onClick={() => onTabChange('seal')}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-[10px] text-xs text-center transition-all duration-150 cursor-pointer ${
                    activeTab === 'seal'
                      ? 'bg-purple-600 text-white border-b-4 border-black/30 shadow-md font-black ring-2 ring-purple-400 ring-offset-1'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                  }`}
                >
                  Seal
                </button>
                <button
                  onClick={() => onTabChange('noc')}
                  className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-[10px] text-xs text-center transition-all duration-150 cursor-pointer ${
                    activeTab === 'noc'
                      ? 'bg-amber-600 text-white border-b-4 border-black/30 shadow-md font-black ring-2 ring-amber-400 ring-offset-1'
                      : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
                  }`}
                >
                  NOC
                </button>
              </div>
            </div>
          </div>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="hidden sm:flex px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs items-center gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border-b-2 border-orange-700 shrink-0"
            >
              <History className="w-4 h-4 text-white" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {historyCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
