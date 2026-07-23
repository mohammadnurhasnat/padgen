import React from 'react';
import { Layers } from 'lucide-react';

interface HeaderNavigationProps {
  activeTab: 'designer' | 'cover-letter' | 'id-card';
  onTabChange: (tab: 'designer' | 'cover-letter' | 'id-card') => void;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-md shadow-sm print:hidden bg-white/95 border-neutral-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--coral-light)] text-[var(--coral-accent)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 m-0 leading-none">
              {activeTab === 'designer'
                ? 'PadGen Studio'
                : activeTab === 'cover-letter'
                ? 'Cover Letter Generator'
                : 'Office ID Card Generator'}
            </h1>
          </div>
        </div>

        {/* TAB CONTROL TOGGLES */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 rounded-full bg-neutral-100 border border-neutral-200 gap-1.5">
            <button
              onClick={() => onTabChange('designer')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                activeTab === 'designer'
                  ? 'bg-emerald-600 text-white border-b-2 border-emerald-900 shadow-md font-bold'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
              }`}
            >
              Pad & Card Designer
            </button>
            <button
              onClick={() => onTabChange('cover-letter')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                activeTab === 'cover-letter'
                  ? 'bg-indigo-600 text-white border-b-2 border-indigo-900 shadow-md font-bold'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
              }`}
            >
              Cover Letter Generator
            </button>
            <button
              onClick={() => onTabChange('id-card')}
              className={`px-4 py-1.5 rounded-full text-xs transition-all duration-150 cursor-pointer ${
                activeTab === 'id-card'
                  ? 'bg-teal-600 text-white border-b-2 border-teal-900 shadow-md font-bold'
                  : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 font-semibold'
              }`}
            >
              Office ID Card
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
