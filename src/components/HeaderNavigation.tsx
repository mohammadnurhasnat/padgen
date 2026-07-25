import React from 'react';
import { Layers, History } from 'lucide-react';

interface HeaderNavigationProps {
  activeTab: 'designer' | 'cover-letter' | 'id-card' | 'noc';
  onTabChange: (tab: 'designer' | 'cover-letter' | 'id-card' | 'noc') => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenHistory,
  historyCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 py-2.5 border-b backdrop-blur-md shadow-2xs print:hidden bg-white/95 border-neutral-200">
      <div className="w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
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
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
          <div className="grid grid-cols-2 sm:flex items-center justify-center p-1 rounded-[10px] bg-neutral-100 border border-neutral-200 gap-1.5 w-full sm:w-auto">
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
            <button
              onClick={() => onTabChange('id-card')}
              className={`w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-1.5 rounded-[10px] text-xs text-center transition-all duration-150 cursor-pointer ${
                activeTab === 'id-card'
                  ? 'bg-teal-600 text-white border-b-4 border-black/30 shadow-md font-black ring-2 ring-teal-400 ring-offset-1'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
              }`}
            >
              Job ID Card
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
