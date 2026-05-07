import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Sparkles, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AstrologyData } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AstrologyData;
}

export default function ReportModal({ isOpen, onClose, data }: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-obsidian/90 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-glass border border-gold/20 rounded-lg shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-obsidian/40">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-5 h-5 text-gold animate-pulse" />
              <div>
                <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-gold">Fusion Astrology Report</h2>
                <p className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest mt-1">Computed Alignment Vector</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gold/10 rounded-full transition-colors text-gold/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-12">
            {/* Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <StatItem label="Western Sun" value={data.sunSign} />
              <StatItem label="Western Moon" value={data.moonSign} />
              <StatItem label="Ascendant" value={data.ascendant} />
              <StatItem label="Bazi Animal" value={data.baziAnimal} />
              <StatItem label="Bazi Daymaster" value={data.baziDaymaster} />
              <StatItem label="Bazi Hour Master" value={data.baziHourMaster} />
              <StatItem label="WuXing Element" value={data.wuXing} />
            </div>

            {/* Interpretation */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-gold">
                <Wand2 className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-[0.2em]">Fusion Interpretation (AI Decoded)</span>
              </div>
              <div className="p-8 bg-obsidian/40 border border-gold/5 rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gold/20 group-hover:bg-gold/40 transition-colors" />
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-foreground/70 prose-headings:text-gold prose-strong:text-gold/80">
                  <ReactMarkdown>{data.interpretation || "Decoding your unique alignment..."}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gold/10 bg-obsidian/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-mono text-foreground/30 uppercase tracking-tighter">
              A private computation based on your specific temporal-spatial origin.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 border border-gold/20 rounded hover:bg-gold/5 transition-colors text-[10px] font-mono uppercase tracking-widest text-gold/80"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gold text-obsidian rounded hover:bg-gold/90 transition-colors text-[10px] font-bold uppercase tracking-widest leading-none">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Signal</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <span className="text-[8px] font-mono text-gold/40 uppercase tracking-[0.2em]">{label}</span>
      <p className="text-sm font-mono text-foreground uppercase tracking-wider">{value}</p>
    </div>
  );
}
