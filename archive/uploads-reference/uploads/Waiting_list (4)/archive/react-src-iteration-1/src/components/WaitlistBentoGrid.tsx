import React from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Database, Zap, Binary, Lock, UserPlus, Award, Check, Sparkles } from 'lucide-react';
import { AstrologyData } from '../types';

interface WaitlistBentoGridProps {
  referrals: number;
  isJoined: boolean;
  astrologyData?: AstrologyData | null;
}

export default function WaitlistBentoGrid({ referrals, isJoined, astrologyData }: WaitlistBentoGridProps) {
  const needsReferrals = Math.max(3 - referrals, 0);
  const isFounding = referrals >= 3;

  const tiles = [
    {
      name: "Position Status",
      icon: Activity,
      content: "#847",
      sub: "of 5k",
      gridArea: "col-span-1",
      extra: (
          <div className="w-full bg-foreground/5 h-[1.5px] mt-2">
              <div className="bg-gold h-full w-[17%]"></div>
          </div>
      )
    },
    {
      name: "Founding Tier",
      icon: ShieldCheck,
      content: "ORIGIN",
      sub: isFounding ? "UNLOCKED" : "LOCKED",
      gridArea: "col-span-1",
      extra: (
        <div className="flex items-center space-x-2 mt-2">
          <div className={`w-6 h-6 border ${isFounding ? 'border-gold' : 'border-gold/30'} rounded-full flex items-center justify-center`}>
              {isFounding ? <Award className="w-3.5 h-3.5 text-gold" /> : <div className="w-3 h-3 border-t-2 border-gold rounded-full animate-spin"></div>}
          </div>
        </div>
      )
    },
    {
      name: "Temporal Engine",
      icon: Binary,
      content: "FUFIRE V1",
      sub: "Active System",
      gridArea: "col-span-2",
      extra: (
          <div className="mt-3 pt-3 border-t border-foreground/5 flex justify-between items-center">
              <span className="text-[8px] font-mono italic text-foreground/40 font-light">Vector Sync: 0.9982</span>
              <span className="text-[8px] font-mono uppercase bg-gold/10 text-gold px-1.5 py-0.5">Secure</span>
          </div>
      )
    },
    {
      name: astrologyData ? "YOUR BIRTHCHART" : "Network Status",
      icon: astrologyData ? Sparkles : UserPlus,
      content: astrologyData ? "" : `${referrals}`,
      sub: astrologyData ? "" : (isFounding ? "Ready" : "Waiting"),
      gridArea: astrologyData ? "col-span-2 row-span-2" : "col-span-2",
      extra: astrologyData ? (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
          <StatMini label="SUNSIGN" value={astrologyData.sunSign} />
          <StatMini label="MOONSIGN" value={astrologyData.moonSign} />
          <StatMini label="ASCENDENT" value={astrologyData.ascendant} />
          <StatMini label="BAZI ANIMAL" value={astrologyData.baziAnimal} />
          <StatMini label="BAZI DAY-MASTER" value={astrologyData.baziDaymaster} />
          <StatMini label="WU-XING" value={astrologyData.wuXing} highlight />
        </div>
      ) : (
          <div className="mt-3 space-y-2">
              <div className="relative w-full h-1 bg-foreground/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((referrals / 3) * 100, 100)}%` }}
                    className="h-full bg-gold shadow-[0_0_5px_rgba(212,175,55,0.3)]"
                  />
              </div>
              <p className="text-[7px] font-mono text-foreground/30 uppercase tracking-tighter">
                {isFounding ? "Primary Node Active" : `Awaiting ${needsReferrals} additional signals`}
              </p>
          </div>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * i }}
          className={`geo-card p-4 flex flex-col justify-between group hover:border-gold/30 min-h-[140px] ${tile.gridArea}`}
        >
          <div>
            <div className="flex items-start justify-between mb-3">
                <span className="text-[8px] font-mono text-gold/40 uppercase tracking-widest">{tile.name}</span>
                <tile.icon className="w-2.5 h-2.5 text-gold/20 group-hover:text-gold transition-colors" />
            </div>
            {tile.content || tile.sub ? (
              <div className="flex items-baseline space-x-1.5 overflow-hidden">
                  {tile.content && <h3 className="text-xl font-mono text-foreground uppercase truncate">{tile.content}</h3>}
                  {tile.sub && <span className="text-[8px] font-mono text-foreground/20 uppercase whitespace-nowrap">{tile.sub}</span>}
              </div>
            ) : null}
          </div>
          {tile.extra}
        </motion.div>
      ))}
    </div>
  );
}

function StatMini({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-[7px] font-mono text-gold/40 uppercase tracking-widest mb-0.5">{label}</span>
      <span className={`text-[10px] font-mono uppercase truncate ${highlight ? 'text-gold font-bold' : 'text-foreground/70'}`}>
        {value}
      </span>
    </div>
  );
}
