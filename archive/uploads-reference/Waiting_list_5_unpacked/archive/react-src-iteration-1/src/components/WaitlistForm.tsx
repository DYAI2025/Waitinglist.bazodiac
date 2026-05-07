import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Share2, Award, Users, ChevronRight, Sparkles } from 'lucide-react';

import ReportModal from './ReportModal';
import { geocodePlace } from '../services/geocodingService';
import { fetchAstrologyData } from '../services/astrologyService';
import { generateFusionInterpretation } from '../services/geminiService';
import { AstrologyData } from '../types';

interface WaitlistState {
  email: string;
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  referralCode?: string;
}

interface SuccessProps {
  data: WaitlistState;
  position: number;
  referralCode: string;
  tier: string;
  initialReferrals?: number;
}

interface WaitlistFormProps {
  onJoin: () => void;
  referrals: number;
  setReferrals: React.Dispatch<React.SetStateAction<number>>;
  onSignalChange?: (signal: { element: string; zodiac: string; coherence: string; tendency: string } | null) => void;
  onAstrologyData?: (data: AstrologyData) => void;
}

export default function WaitlistForm({ onJoin, referrals, setReferrals, onSignalChange, onAstrologyData }: WaitlistFormProps) {
  const [step, setStep] = useState<'data' | 'email' | 'success'>('data');
  const [formData, setFormData] = useState<WaitlistState>({ email: '' });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [dataErrors, setDataErrors] = useState<{ [key: string]: string | null }>({});
  const [successData, setSuccessData] = useState<Omit<SuccessProps, 'referrals' | 'setReferrals'> | null>(null);
  const [astroData, setAstroData] = useState<AstrologyData | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'email') {
      emailInputRef.current?.focus();
    }
  }, [step]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateData = () => {
    const errors: { [key: string]: string | null } = {};
    if (!formData.birthDate) errors.birthDate = 'Required for signal.';
    if (!formData.birthTime) errors.birthTime = 'Required.';
    if (!formData.birthPlace || formData.birthPlace.trim().length < 2) errors.birthPlace = 'Location precision required.';
    
    setDataErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateMicroSignal = () => {
    if (!formData.birthDate) return null;
    
    const date = new Date(formData.birthDate);
    const dateNum = date.getTime();
    
    const elements = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'];
    const element = elements[dateNum % elements.length];
    
    // Western Zodiac logic
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const zodiacs = [
      { name: 'Capricorn', start: '12-22' }, { name: 'Aquarius', start: '01-20' },
      { name: 'Pisces', start: '02-19' }, { name: 'Aries', start: '03-21' },
      { name: 'Taurus', start: '04-20' }, { name: 'Gemini', start: '05-21' },
      { name: 'Cancer', start: '06-21' }, { name: 'Leo', start: '07-23' },
      { name: 'Virgo', start: '08-23' }, { name: 'Libra', start: '09-23' },
      { name: 'Scorpio', start: '10-23' }, { name: 'Sagittarius', start: '11-22' }
    ];
    
    let zodiac = 'Astral';
    for (let i = 0; i < zodiacs.length; i++) {
        const [m, d] = zodiacs[i].start.split('-').map(Number);
        if ((month === m && day >= d) || (month === (m % 12) + 1 && day < Number(zodiacs[(i + 1) % 12].start.split('-')[1]))) {
            zodiac = zodiacs[i].name;
            break;
        }
    }

    const coherence = (0.75 + (dateNum % 250) / 1000).toFixed(4);
    const tendency = dateNum % 2 === 0 ? 'DIVERGENT' : 'CONVERGENT';
    
    return { element, zodiac, coherence, tendency };
  };

  const microSignal = calculateMicroSignal();

  useEffect(() => {
    if (onSignalChange) {
      onSignalChange(microSignal);
    }
  }, [JSON.stringify(microSignal), onSignalChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'data') {
      if (validateData()) {
        setStep('email');
      }
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Invalid signal vector: Email format rejected.');
      return;
    }

    setEmailError(null);
    setLoading(true);

    try {
      // 1. Geocode birth place
      let lat = 0, lng = 0;
      if (formData.birthPlace) {
        try {
          const coords = await geocodePlace(formData.birthPlace);
          lat = coords.lat;
          lng = coords.lng;
        } catch (e) {
          console.warn('Geocoding failed, using fallback coords', e);
        }
      }

      // 2. Fetch Astrology Data if birth info provided
      if (formData.birthDate && formData.birthTime) {
        const astrology = await fetchAstrologyData({
          date: formData.birthDate,
          time: formData.birthTime,
          place: formData.birthPlace || '',
          lat,
          lng
        });

        // 3. Generate Interpretation via Gemini
        const interpretation = await generateFusionInterpretation(astrology);
        const finalAstro = { ...astrology, interpretation };
        
        setAstroData(finalAstro);
        if (onAstrologyData) {
          onAstrologyData(finalAstro);
        }
      }
    } catch (error) {
      console.error('Error in capture process:', error);
    }
    
    const position = Math.floor(Math.random() * 1000) + 501;
    const refCode = (formData.email.split('@')[0] || 'SIG').toUpperCase() + Math.random().toString(36).substring(7).toUpperCase();
    
    setSuccessData({
      data: formData,
      position,
      referralCode: refCode,
      tier: 'Signal Waitlist',
    });
    setLoading(false);
    onJoin();
    setStep('success');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmailError(null);
    if (dataErrors[name]) {
      setDataErrors(prev => ({ ...prev, [name]: null }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative z-10 w-full">
      <AnimatePresence mode="wait">
        {step !== 'success' ? (
            <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-6 bg-glass border-[0.5px] border-glass-border rounded-lg space-y-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl saturate-[1.2] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
            
            <header>
              <span className="mono-label tracking-[0.3em] mb-1 block">
                {step === 'data' ? 'Engine Input (Optional)' : 'Secure your Signal'}
              </span>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 'data' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase text-foreground/40 font-mono tracking-widest">Birth Date</label>
                      {dataErrors.birthDate && (
                        <span className="text-[8px] font-mono text-red-400 uppercase">{dataErrors.birthDate}</span>
                      )}
                    </div>
                    <input
                      name="birthDate"
                      type="date"
                      onChange={handleInputChange}
                      className={`geo-input ${dataErrors.birthDate ? 'border-red-400/50' : ''}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase text-foreground/40 font-mono tracking-widest">Birth Time</label>
                      {dataErrors.birthTime && (
                        <span className="text-[8px] font-mono text-red-400 uppercase">{dataErrors.birthTime}</span>
                      )}
                    </div>
                    <input
                      name="birthTime"
                      type="time"
                      onChange={handleInputChange}
                      className={`geo-input ${dataErrors.birthTime ? 'border-red-400/50' : ''}`}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase text-foreground/40 font-mono tracking-widest">Birth Place</label>
                      {dataErrors.birthPlace && (
                        <span className="text-[8px] font-mono text-red-400 uppercase">{dataErrors.birthPlace}</span>
                      )}
                    </div>
                    <input
                      name="birthPlace"
                      placeholder="City, Country"
                      onChange={handleInputChange}
                      className={`geo-input ${dataErrors.birthPlace ? 'border-red-400/50' : ''}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Micro-Signal Preview */}
                  {microSignal && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gold/5 border border-gold/20 rounded-sm grid grid-cols-3 gap-4"
                    >
                      <div className="text-center">
                        <span className="text-[8px] font-mono text-gold/50 uppercase block mb-1">Element</span>
                        <span className="text-[10px] font-mono text-gold font-bold">{microSignal.element}</span>
                      </div>
                      <div className="text-center border-x border-gold/10">
                        <span className="text-[8px] font-mono text-gold/50 uppercase block mb-1">Tendency</span>
                        <span className="text-[10px] font-mono text-foreground">{microSignal.tendency}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] font-mono text-gold/50 uppercase block mb-1">Coherence</span>
                        <span className="text-[10px] font-mono text-foreground">{microSignal.coherence}</span>
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase text-foreground/40 font-mono tracking-widest">Email Address *</label>
                      {emailError && (
                        <motion.span 
                          initial={{ opacity: 0, x: 5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-[9px] font-mono text-red-400 uppercase font-bold"
                        >
                          {emailError}
                        </motion.span>
                      )}
                    </div>
                    <input
                      required
                      ref={emailInputRef}
                      name="email"
                      type="email"
                      placeholder="user@firmament.dev"
                      onChange={handleInputChange}
                      className={`geo-input ${emailError ? 'border-red-400/50 focus:border-red-400' : ''}`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="geo-button"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-obsidian/20 border-t-obsidian rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{step === 'data' ? 'Continue' : 'Join the Signal Waitlist'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {step === 'email' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-px bg-foreground/10 flex-1"></div>
                    <span className="mono-label text-[8px] opacity-40">or connect via</span>
                    <div className="h-px bg-foreground/10 flex-1"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      aria-label="Sign up with Google"
                      className="flex items-center justify-center gap-2 py-3 bg-foreground/5 border border-foreground/10 rounded hover:bg-foreground/10 transition-colors text-[10px] font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-gold/50"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </button>
                    <button 
                      type="button"
                      aria-label="Sign up with Github"
                      className="flex items-center justify-center gap-2 py-3 bg-foreground/5 border border-foreground/10 rounded hover:bg-foreground/10 transition-colors text-[10px] font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-gold/50"
                    >
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                      Github
                    </button>
                  </div>
                </div>
              )}
              
              <p className="text-[9px] text-center text-foreground/30 font-mono tracking-tighter uppercase px-4">
                No fatalistic predictions. Data used only for deterministic signal generation.
              </p>

              {step === 'data' && (
                <button 
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-full text-[10px] font-mono text-foreground/40 hover:text-gold transition-colors uppercase tracking-widest"
                >
                  Skip technical input
                </button>
              )}
            </form>
          </motion.div>
        ) : (
          <SuccessState 
            {...successData!} 
            referrals={referrals}
            setReferrals={setReferrals}
            astroData={astroData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface SuccessStateProps extends Omit<SuccessProps, 'initialReferrals'> {
    referrals: number;
    setReferrals: React.Dispatch<React.SetStateAction<number>>;
    astroData: AstrologyData | null;
}

function SuccessState({ position, referralCode, referrals, setReferrals, astroData }: SuccessStateProps) {
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shareLink = `https://bazodiac.com/join?ref=${referralCode}`;

  const hasFoundingBadge = referrals >= 3;
  const currentTier = hasFoundingBadge ? 'Founding Member' : 'Signal Waitlist';

  useEffect(() => {
    // Move focus to the heading when success state is revealed
    headingRef.current?.focus();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateReferral = () => {
    setReferrals(prev => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      role="region"
      aria-labelledby="success-heading"
      className="p-8 bg-glass border-[0.5px] border-glass-border rounded-sm relative overflow-hidden backdrop-blur-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] saturate-[1.2]"
    >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gold/50 shadow-[0_0_10px_rgba(212,175,55,0.3)]" />
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-gold">
              <Check className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Signal Reserved</span>
          </div>
          {hasFoundingBadge && (
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-gold text-obsidian rounded-sm"
              role="img"
              aria-label="Founding Member Status"
            >
              <Award className="w-3 h-3" aria-hidden="true" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Founding</span>
            </motion.div>
          )}
        </div>

        <h2 
          id="success-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-extralight uppercase tracking-widest mb-8 outline-none focus:ring-0"
        >
          Access Granted.
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4" role="group" aria-label="Waitlist Statistics">
            <div className="p-5 bg-obsidian border border-foreground/5">
                <span className="text-[10px] font-mono text-gold/50 uppercase block mb-2" id="queue-pos-label">Queue Pos.</span>
                <span className="text-3xl font-mono text-gold tracking-tight" aria-labelledby="queue-pos-label">#{position}</span>
            </div>
            <div 
              className={`p-5 bg-obsidian border transition-all duration-500 flex flex-col justify-center relative overflow-hidden group/tier ${hasFoundingBadge ? 'border-gold/60 shadow-[0_0_25px_rgba(212,175,55,0.1)]' : 'border-foreground/5'}`}
              role="group"
              aria-label="Membership Status"
            >
                {hasFoundingBadge && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-linear-to-br from-gold/10 via-transparent to-transparent pointer-events-none"
                  />
                )}
                <span className="text-[10px] font-mono text-gold/50 uppercase block mb-1">Status</span>
                <div className="flex flex-wrap items-center gap-2 relative z-10">
                  <span className={`text-[10px] font-mono uppercase tracking-[0.15em] transition-colors ${hasFoundingBadge ? 'text-gold font-bold' : 'text-foreground/80'}`}>
                    {hasFoundingBadge ? 'Beta Status' : 'Signal Level'}
                  </span>
                  {hasFoundingBadge && (
                    <motion.div 
                      initial={{ scale: 0, x: -10 }}
                      animate={{ scale: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-linear-to-br from-[#F1D18A] via-[#D4AF37] to-[#CF995F] text-obsidian px-2 py-0.5 rounded-[2px] shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-1.5 border border-white/30 relative overflow-hidden group/badge"
                    >
                      <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-12"
                      />
                      <Award className="w-3 h-3 relative z-10" />
                      <span className="text-[9px] font-bold uppercase tracking-tight relative z-10">Founding Member</span>
                    </motion.div>
                  )}
                  {!hasFoundingBadge && (
                    <span className="text-[10px] font-mono text-foreground tracking-tight uppercase">
                      Individual
                    </span>
                  )}
                </div>
                {hasFoundingBadge && (
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gold/5 blur-xl group-hover/tier:bg-gold/10 transition-colors rounded-full" />
                )}
            </div>
        </div>

        {/* Fusion Report Trigger */}
        {astroData && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button 
              onClick={() => setIsReportOpen(true)}
              className="w-full group p-4 border border-gold/30 bg-gold/5 flex items-center justify-between hover:bg-gold/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-3 text-gold">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <div className="text-left">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] block">Your Alignment Decoded</span>
                  <span className="text-[8px] font-mono text-gold/60 uppercase">Fusion Interpretation Ready</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
            </button>
            <ReportModal 
              isOpen={isReportOpen} 
              onClose={() => setIsReportOpen(false)} 
              data={astroData} 
            />
          </motion.div>
        )}

        {/* New Referral Counter Dashboard */}
        <div 
          className="mb-8 p-4 bg-foreground/3 border border-foreground/5 rounded-sm"
          role="group"
          aria-label="Referral Dashboard"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-gold/60 uppercase" id="progress-label">Referral Progress</span>
            <span className="text-[10px] font-mono text-gold" aria-live="polite" aria-atomic="true">
              {referrals} <span className="sr-only">out of</span> / 3
            </span>
          </div>
          <div 
            className="w-full bg-foreground/5 h-1.5 rounded-full overflow-hidden"
            role="progressbar"
            aria-labelledby="progress-label"
            aria-valuenow={referrals}
            aria-valuemin={0}
            aria-valuemax={3}
          >
            <motion.div 
              className="bg-gold h-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((referrals / 3) * 100, 100)}%` }}
            />
          </div>
          {!hasFoundingBadge ? (
            <p className="text-[9px] font-mono text-foreground/30 mt-3 uppercase tracking-tighter">
              Invite {3 - referrals} more thinkers to unlock Founding Badge
            </p>
          ) : (
            <p className="text-[9px] font-mono text-gold mt-3 uppercase tracking-tighter font-bold">
              Founding Perks Unlocked
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-foreground/5">
            <p className="text-[10px] text-foreground/50 font-mono uppercase tracking-widest leading-loose">
              Share your link to climb the queue.
            </p>
            <div className="flex items-center gap-2 p-1 bg-obsidian border border-foreground/10 group focus-within:border-gold/50 transition-colors">
                <label htmlFor="share-link" className="sr-only">Your referral link</label>
                <input 
                    id="share-link"
                    readOnly
                    value={shareLink}
                    className="bg-transparent text-[10px] font-mono flex-1 px-3 outline-none text-foreground/70"
                />
                <button 
                    onClick={handleCopy}
                    aria-label={copied ? "Link copied to clipboard" : "Copy referral link to clipboard"}
                    className="bg-gold text-obsidian px-3 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-gold/80 focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-obsidian outline-none"
                >
                    {copied ? "Copied" : "Copy Link"}
                </button>
            </div>
            <div className="sr-only" aria-live="polite">
              {copied ? "Referral link copied to clipboard" : ""}
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-foreground/5 flex flex-col gap-4">
            <div className="flex justify-center space-x-8 opacity-40 grayscale">
                <div className="flex items-center gap-2 text-[9px] font-mono text-gold">
                  <Users className="w-3 h-3" />
                  <span>{847 + referrals} Active</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono">
                  <Award className="w-3 h-3" />
                  <span>Founding Slot Open</span>
                </div>
            </div>
            
            {/* Mock Action for testing */}
            <button 
              onClick={simulateReferral}
              className="text-[9px] font-mono text-gold/30 hover:text-gold transition-colors uppercase tracking-[0.2em] border border-gold/10 py-2 hover:bg-gold/5"
            >
              [ Dev: Simulate Referral ]
            </button>
        </div>
    </motion.div>
  );
}
