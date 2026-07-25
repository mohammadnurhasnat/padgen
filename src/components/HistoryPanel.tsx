import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Download, Trash2, X, ChevronDown, ChevronUp, FileText, Layers, CreditCard, Award, CheckCircle2 } from 'lucide-react';
import { HistoryItem, HistorySection } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  onDownloadItemAgain: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  activeSection?: HistorySection;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  historyList,
  onLoadItem,
  onDownloadItemAgain,
  onClearHistory,
  onDeleteItem,
  activeSection,
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | HistorySection>('all');

  useEffect(() => {
    if (isOpen && activeSection) {
      setSelectedFilter(activeSection);
    }
  }, [isOpen, activeSection]);

  const formatTypeLabel = (item: HistoryItem) => {
    const type = item.type || '';
    if (type.includes('pdf')) return 'PDF Document';
    if (type.includes('png')) return 'PNG Image';
    if (type.includes('svg')) return 'SVG Vector';
    if (type.includes('ai')) return 'Illustrator (.AI)';
    if (type.includes('psd')) return 'Photoshop (.PSD)';
    return 'Exported Document';
  };

  const getSectionBadge = (section?: HistorySection) => {
    switch (section) {
      case 'designer':
        return { label: 'Pad & Card', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Layers };
      case 'cover-letter':
        return { label: 'Cover Letter', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: FileText };
      case 'id-card':
        return { label: 'Job ID Card', color: 'bg-teal-100 text-teal-800 border-teal-300', icon: CreditCard };
      case 'noc':
        return { label: 'NOC Certificate', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Award };
      default:
        return { label: 'Pad & Card', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: Layers };
    }
  };

  const getItemTitle = (item: HistoryItem) => {
    if (item.title) return item.title;
    if (item.data?.companyName) return item.data.companyName;
    if (item.coverFields?.companyName || item.coverFields?.applicantName) {
      return item.coverFields.companyName || item.coverFields.applicantName;
    }
    if (item.nocFields?.companyName || item.nocFields?.applicantName) {
      return item.nocFields.companyName || item.nocFields.applicantName;
    }
    return item.filename || 'Exported Document';
  };

  const filteredList = historyList.filter((item) => {
    if (selectedFilter === 'all') return true;
    const sec = item.section || 'designer';
    return sec === selectedFilter;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white border-l border-[#DDDEDC] shadow-[0_0_40px_rgba(0,0,0,0.15)] z-50 flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#DDDEDC] bg-[#FBFBFA] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-amber-500 text-white shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1C1E22] flex items-center gap-2 m-0">
                      <span>Download History</span>
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        {historyList.length}
                      </span>
                    </h2>
                    <p className="text-[11px] text-neutral-500 m-0">Click any item to edit, load or re-download</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Active Section Indicator & 4 Main Section Buttons in Series */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                  <span>FILTER BY SECTION:</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Active: {
                      selectedFilter === 'designer' ? 'Pad & Card' :
                      selectedFilter === 'cover-letter' ? 'Cover Letter' :
                      selectedFilter === 'id-card' ? 'Job ID Card' :
                      selectedFilter === 'noc' ? 'NOC' : 'All Sections'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                      selectedFilter === 'all'
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200/60'
                    }`}
                  >
                    All ({historyList.length})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('designer')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                      selectedFilter === 'designer'
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    Pad & Card
                  </button>
                  <button
                    onClick={() => setSelectedFilter('cover-letter')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                      selectedFilter === 'cover-letter'
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400'
                        : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
                    }`}
                  >
                    Cover Letter
                  </button>
                  <button
                    onClick={() => setSelectedFilter('id-card')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                      selectedFilter === 'id-card'
                        ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-400'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
                    }`}
                  >
                    Job ID Card
                  </button>
                  <button
                    onClick={() => setSelectedFilter('noc')}
                    className={`py-1.5 px-1 rounded-lg font-bold transition-all cursor-pointer text-center truncate ${
                      selectedFilter === 'noc'
                        ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-400'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                    }`}
                  >
                    NOC
                  </button>
                </div>
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-neutral-50">
              {filteredList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 px-4">
                  <Clock className="w-10 h-10 text-neutral-300 mb-2" />
                  <h3 className="text-xs font-bold text-neutral-700">No History Records Found</h3>
                  <p className="text-[11px] text-neutral-500 max-w-[240px] mt-1">
                    When you download documents from any section, they will automatically be saved here.
                  </p>
                </div>
              ) : (
                filteredList.map((item) => {
                  const badge = getSectionBadge(item.section);
                  const Icon = badge.icon;
                  const isExpanded = expandedItemId === item.id;
                  const title = getItemTitle(item);

                  return (
                    <div
                      key={item.id}
                      className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-2xs hover:border-neutral-300 transition-all"
                    >
                      <div
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-neutral-50/80 transition-colors"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 shrink-0 ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 m-0 truncate">
                            {title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                            {item.timestamp}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-500" />
                          )}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-3.5 pb-3.5 flex flex-col gap-2.5 border-t border-neutral-100 pt-2.5 bg-neutral-50/50"
                          >
                            <div className="text-[11px] text-neutral-600 space-y-1">
                              <div className="flex justify-between">
                                <span className="text-neutral-400">Downloaded:</span>
                                <span className="font-semibold text-neutral-700">{item.timestamp}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-400">File Format:</span>
                                <span className="font-semibold text-neutral-700">{formatTypeLabel(item)}</span>
                              </div>
                              {item.filename && (
                                <div className="flex justify-between truncate">
                                  <span className="text-neutral-400">Filename:</span>
                                  <span className="font-mono text-[10px] text-neutral-600 truncate max-w-[200px]">{item.filename}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => {
                                  onLoadItem(item);
                                  onClose();
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span>Edit & Load</span>
                              </button>
                              <button
                                onClick={() => onDownloadItemAgain(item)}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-1.5 px-2 rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer transition-all flex items-center justify-center"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {historyList.length > 0 && (
              <div className="p-3.5 bg-[#FBFBFA] border-t border-[#DDDEDC] flex justify-between items-center">
                <span className="text-[11px] text-neutral-500">
                  Total saved: {historyList.length} items
                </span>
                <button
                  onClick={onClearHistory}
                  className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

