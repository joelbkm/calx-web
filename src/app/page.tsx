'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import Image from 'next/image';
import { useI18n } from '@/i18n';
import { motion } from 'framer-motion';
import {
  Camera,
  BarChart3,
  Zap,
  Users,
  Clock,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  Mic,
  ScanBarcode,
  TrendingUp,
  Flame,
  BicepsFlexed,
  MapPin,
  Bot,
  LineChart,
  ImagePlus,
  Shield,
  Smartphone,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } },
} as const;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
} as const;

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
} as const;

export default function HomePage() {
  const { t } = useI18n();

  return (
    <PublicLayout>
      {/* ══════════════════════════════════════════════════════
          ── HERO SECTION ──────────────────────────────────────
          ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-400/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-gold-400/8 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-calx-surface-variant/30 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-600/3 rounded-full blur-[200px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,168,67,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(212,168,67,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-6">
                <span className="text-5xl sm:text-6xl font-black gradient-text tracking-tight">CalX</span>
              </motion.div>

              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-sm font-medium mb-6 backdrop-blur-sm">
                <Sparkles size={14} className="animate-pulse" />
                {t.heroBadge}
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
                <span className="text-calx-text">{t.heroTitle1}</span>
                <br />
                <span className="gradient-text">{t.heroTitle2}</span>
                <span className="text-calx-text">{t.heroTitle3}</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-calx-text-secondary leading-relaxed">
                {t.heroSubtitle1}
                {' '}{t.heroSubtitle2}
                <span className="text-calx-text font-semibold">{t.heroSubtitle3}</span>{t.heroSubtitle4}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="#download" className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-400 to-gold-600 text-black font-bold rounded-full hover:shadow-xl hover:shadow-gold-400/30 transition-all text-base">
                  {t.heroCta}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#scanner" className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-calx-surface text-calx-text font-semibold rounded-full hover:bg-calx-surface/50 hover:border-calx-card transition-all text-base backdrop-blur-sm">
                  {t.heroCtaSecondary}
                  <ChevronRight size={18} />
                </a>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['🏋️', '🧘', '🏃', '💪', '🥗'].map((emoji, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-calx-surface to-calx-card border-2 border-calx-bg flex items-center justify-center text-base shadow-lg">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={12} className="fill-gold-400 text-gold-400" />
                      ))}
                    </div>
                    <p className="text-xs text-calx-text-secondary mt-0.5">{t.heroUsers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-calx-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Camera size={13} className="text-gold-400" />
                    <span>{t.heroFree}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield size={13} className="text-gold-400" />
                    <span>{t.heroSecure}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0, 0, 0.2, 1] }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative flex justify-center">
                <Image
                  src="/mockup-dashboard.png"
                  alt="CalX Dashboard - Activity Score, macros et activité du jour"
                  width={480}
                  height={480}
                  className="relative z-10 w-full max-w-[340px] lg:max-w-[400px] drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP VALUE PROP ── */}
      <section className="py-20 border-t border-calx-surface/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: <Camera size={24} />, title: t.step01Title, desc: t.step01Desc },
              { step: '02', icon: <Zap size={24} />, title: t.step02Title, desc: t.step02Desc },
              { step: '03', icon: <TrendingUp size={24} />, title: t.step03Title, desc: t.step03Desc },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="relative text-center group">
                <div className="text-6xl font-black text-calx-surface/80 absolute -top-4 left-1/2 -translate-x-1/2">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-lg font-bold text-calx-text mb-2">{item.title}</h3>
                  <p className="text-sm text-calx-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ── APP SCREENSHOTS SECTION ───────────────────────────
          ══════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden border-t border-calx-surface/50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/3 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Smartphone size={12} className="inline mr-1" />Application Mobile
              </span>
              <h2 className="text-3xl sm:text-5xl font-black">
                <span className="text-calx-text">Découvrez </span>
                <span className="gradient-text">CalX en action</span>
              </h2>
              <p className="mt-4 text-calx-text-secondary text-lg max-w-2xl mx-auto">
                Une interface conçue pour la simplicité — suivez, scannez, et progressez en quelques secondes.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Mockup 1: Dashboard */}
              <motion.div variants={scaleIn} className="flex flex-col items-center gap-6 group">
                <div className="relative">
                  <Image
                    src="/mockup-dashboard.png"
                    alt="Dashboard CalX - Activity Score, macros et activité du jour"
                    width={320}
                    height={320}
                    className="relative z-10 w-full max-w-[240px] mx-auto drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500"
                  />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-medium mb-2">
                    <BarChart3 size={11} /> Dashboard
                  </div>
                  <h3 className="text-lg font-bold text-calx-text mb-1">Tout en un coup d&apos;œil</h3>
                  <p className="text-sm text-calx-text-secondary">Activity Score, calories, macros et activité physique — votre journée résumée à l&apos;instant T.</p>
                </div>
              </motion.div>

              {/* Mockup 2: Nutrition */}
              <motion.div variants={scaleIn} className="flex flex-col items-center gap-6 group md:mt-8">
                <div className="relative">
                  <Image
                    src="/mockup-scanner.png"
                    alt="Nutrition CalX - suivi calories, macros et repas scannés"
                    width={320}
                    height={320}
                    className="relative z-10 w-full max-w-[240px] mx-auto drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500"
                  />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-400/10 border border-neon-400/20 text-neon-400 text-xs font-medium mb-2">
                    <Camera size={11} /> Nutrition
                  </div>
                  <h3 className="text-lg font-bold text-calx-text mb-1">Bilan calorique précis</h3>
                  <p className="text-sm text-calx-text-secondary">Scan photo, dictée vocale ou code-barres — vos repas enregistrés en quelques secondes.</p>
                </div>
              </motion.div>

              {/* Mockup 3: Coach IA */}
              <motion.div variants={scaleIn} className="flex flex-col items-center gap-6 group">
                <div className="relative">
                  <Image
                    src="/mockup-coach.png"
                    alt="AI Coach CalX - plan repas personnalisé semaine"
                    width={320}
                    height={320}
                    className="relative z-10 w-full max-w-[240px] mx-auto drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-500"
                  />
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-200/10 border border-gold-200/20 text-gold-200 text-xs font-medium mb-2">
                    <Bot size={11} /> AI Coach
                  </div>
                  <h3 className="text-lg font-bold text-calx-text mb-1">Plan repas sur mesure</h3>
                  <p className="text-sm text-calx-text-secondary">Votre coach génère un menu semaine complet adapté à votre objectif et vos préférences.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SCANNER IA ── */}
      <section id="scanner" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/3 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-4">{t.scannerBadge}</span>
              <h2 className="text-3xl sm:text-5xl font-black">
                <span className="text-calx-text">{t.scannerTitle1}</span><br />
                <span className="gradient-text">{t.scannerTitle2}</span>
              </h2>
              <p className="mt-4 text-calx-text-secondary text-lg max-w-2xl mx-auto">{t.scannerSubtitle}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                { icon: <Camera size={28} />, title: t.scanPhotoTitle, subtitle: t.scanPhotoSub, desc: t.scanPhotoDesc, tag: t.scanPhotoTag, tagColor: 'from-gold-400 to-gold-600', features: [t.scanPhotoF1, t.scanPhotoF2, t.scanPhotoF3] },
                { icon: <Mic size={28} />, title: t.scanVoiceTitle, subtitle: t.scanVoiceSub, desc: t.scanVoiceDesc, tag: t.scanVoiceTag, tagColor: 'from-neon-400 to-neon-600', features: [t.scanVoiceF1, t.scanVoiceF2, t.scanVoiceF3] },
                { icon: <ScanBarcode size={28} />, title: t.scanBarcodeTitle, subtitle: t.scanBarcodeSub, desc: t.scanBarcodeDesc, tag: t.scanBarcodeTag, tagColor: 'from-gold-200 to-gold-400', features: [t.scanBarcodeF1, t.scanBarcodeF2, t.scanBarcodeF3] },
              ].map((card, i) => (
                <motion.div key={i} variants={scaleIn} className="group">
                  <div className="h-full bg-calx-surface/60 border border-calx-surface rounded-2xl p-6 hover:border-calx-card-hover transition-all card-glow">
                    <div className={`inline-block px-2.5 py-1 rounded-full bg-gradient-to-r ${card.tagColor} text-black text-[10px] font-bold uppercase tracking-wider mb-4`}>{card.tag}</div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-calx-card flex items-center justify-center text-gold-400">{card.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-calx-text">{card.title}</h3>
                        <p className="text-xs text-calx-text-muted">{card.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-calx-text-secondary leading-relaxed mb-4">{card.desc}</p>
                    <ul className="space-y-2">
                      {card.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-calx-text-muted">
                          <CheckCircle size={12} className="text-neon-400 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-24 border-t border-calx-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black">
                <span className="text-calx-text">{t.featuresTitle1}</span><br />
                <span className="gradient-text">{t.featuresTitle2}</span>
              </h2>
              <p className="mt-4 text-calx-text-secondary text-lg max-w-2xl mx-auto">{t.featuresSubtitle}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dashboard — Large card */}
              <motion.div variants={fadeUp} className="md:row-span-2 bg-calx-surface/60 border border-calx-surface rounded-2xl p-7 card-glow group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/5 flex items-center justify-center text-gold-400 mb-5 group-hover:scale-110 transition-transform"><BarChart3 size={28} /></div>
                <h3 className="text-xl font-bold text-calx-text mb-3">{t.featureDashboardTitle}</h3>
                <p className="text-calx-text-secondary text-sm leading-relaxed mb-5">{t.featureDashboardDesc}</p>
                <ul className="space-y-2.5 text-sm text-calx-text-secondary">
                  {[t.featureDashboardF1, t.featureDashboardF2, t.featureDashboardF3, t.featureDashboardF4].map((item, i) => (
                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gold-400" />{item}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Activity Score */}
              <motion.div variants={fadeUp} className="bg-calx-surface/60 border border-calx-surface rounded-2xl p-6 card-glow group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/5 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform"><Flame size={24} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-calx-text">{t.featureScoreTitle}</h3>
                    <p className="text-xs text-calx-text-muted">{t.featureScoreSub}</p>
                  </div>
                </div>
                <p className="text-sm text-calx-text-secondary leading-relaxed">{t.featureScoreDesc}</p>
              </motion.div>

              {/* Exercise */}
              <motion.div variants={fadeUp} className="bg-calx-surface/60 border border-calx-surface rounded-2xl p-6 card-glow group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-400/20 to-neon-600/5 flex items-center justify-center text-neon-400 group-hover:scale-110 transition-transform"><BicepsFlexed size={24} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-calx-text">{t.featureExerciseTitle}</h3>
                    <p className="text-xs text-calx-text-muted">{t.featureExerciseSub}</p>
                  </div>
                </div>
                <p className="text-sm text-calx-text-secondary leading-relaxed">{t.featureExerciseDesc}</p>
              </motion.div>

              {/* Coach IA — Large card with sub-features */}
              <motion.div variants={fadeUp} className="md:row-span-2 bg-calx-surface/60 border border-calx-surface rounded-2xl p-7 card-glow group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold-200/20 to-gold-400/5 flex items-center justify-center text-gold-200 mb-5 group-hover:scale-110 transition-transform"><Bot size={28} /></div>
                <h3 className="text-xl font-bold text-calx-text mb-3">{t.featureCoachTitle}</h3>
                <p className="text-calx-text-secondary text-sm leading-relaxed mb-4">{t.featureCoachDesc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {t.featureCoachTags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-[10px] font-medium">{tag}</span>
                  ))}
                </div>
                <ul className="space-y-2.5 text-sm text-calx-text-secondary">
                  {[t.featureCoachF1, t.featureCoachF2, t.featureCoachF3, t.featureCoachF4, t.featureCoachF5, t.featureCoachF6, t.featureCoachF7].map((item, i) => (
                    <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gold-400" />{item}</li>
                  ))}
                </ul>
              </motion.div>

              {/* Evolution Photos */}
              <motion.div variants={fadeUp} className="bg-calx-surface/60 border border-calx-surface rounded-2xl p-6 card-glow group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-200/20 to-gold-400/5 flex items-center justify-center text-gold-200 group-hover:scale-110 transition-transform"><ImagePlus size={24} /></div>
                  <div>
                    <h3 className="text-lg font-bold text-calx-text">{t.featurePhotosTitle}</h3>
                    <p className="text-xs text-calx-text-muted">{t.featurePhotosSub}</p>
                  </div>
                </div>
                <p className="text-sm text-calx-text-secondary leading-relaxed">{t.featurePhotosDesc}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SQUADS SOCIAL ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/3 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="inline-block px-3 py-1 rounded-full bg-neon-400/10 border border-neon-400/20 text-neon-400 text-xs font-semibold uppercase tracking-wider mb-4">{t.squadsBadge}</span>
              <h2 className="text-3xl sm:text-5xl font-black">
                <span className="text-calx-text">{t.squadsTitle1}</span>{' '}
                <span className="gradient-text">{t.squadsTitle2}</span>
              </h2>
              <p className="mt-4 text-calx-text-secondary text-lg max-w-2xl mx-auto">{t.squadsSubtitle}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Users size={22} />, title: t.squad1Title, desc: t.squad1Desc },
                { icon: <Heart size={22} />, title: t.squad2Title, desc: t.squad2Desc },
                { icon: <Target size={22} />, title: t.squad3Title, desc: t.squad3Desc },
                { icon: <Star size={22} />, title: t.squad4Title, desc: t.squad4Desc },
              ].map((item, i) => (
                <motion.div key={i} variants={scaleIn} className="bg-calx-surface/60 border border-calx-surface rounded-2xl p-5 text-center card-glow group">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-base font-bold text-calx-text mb-2">{item.title}</h3>
                  <p className="text-xs text-calx-text-secondary leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── ADVANTAGES ── */}
      <section id="advantages" className="py-24 border-t border-calx-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-black text-calx-text">
                {t.advantagesTitle}<span className="gradient-text">{t.advantagesTitle2}</span>{t.advantagesTitle3}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Clock size={32} />, title: t.adv1Title, desc: t.adv1Desc, stat: t.adv1Stat, statLabel: t.adv1Label },
                { icon: <Heart size={32} />, title: t.adv2Title, desc: t.adv2Desc, stat: t.adv2Stat, statLabel: t.adv2Label },
                { icon: <Target size={32} />, title: t.adv3Title, desc: t.adv3Desc, stat: t.adv3Stat, statLabel: t.adv3Label },
              ].map((adv, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center group">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 mb-6 group-hover:scale-110 transition-transform">{adv.icon}</div>
                  <h3 className="text-xl font-bold text-calx-text mb-3">{adv.title}</h3>
                  <p className="text-calx-text-secondary leading-relaxed text-sm mb-4">{adv.desc}</p>
                  <div className="pt-4 border-t border-calx-surface">
                    <p className="text-3xl font-black gradient-text">{adv.stat}</p>
                    <p className="text-xs text-calx-text-muted mt-1">{adv.statLabel}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TECH STACK STRIP ── */}
      <section className="py-12 border-y border-calx-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="flex flex-wrap items-center justify-center gap-8 text-calx-text-muted text-sm">
            {[
              { icon: <Smartphone size={16} />, label: t.techIos },
              { icon: <Shield size={16} />, label: t.techFirebase },
              { icon: <Bot size={16} />, label: t.techGemini },
              { icon: <MapPin size={16} />, label: t.techGps },
              { icon: <LineChart size={16} />, label: t.techRealtime },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.icon}<span>{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DOWNLOAD CTA ── */}
      <section id="download" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-400/8 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <span className="text-6xl mb-4 block">{t.ctaEmoji}</span>
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                <span className="text-calx-text">{t.ctaTitle1}</span><br />
                <span className="gradient-text">{t.ctaTitle2}</span>
              </h2>
              <p className="text-calx-text-secondary text-lg mb-12 max-w-2xl mx-auto leading-relaxed">{t.ctaSubtitle}</p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-calx-text text-calx-bg font-bold rounded-2xl hover:bg-calx-text-secondary hover:scale-105 transition-all shadow-lg shadow-white/10">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-60">{t.ctaAppStoreLabel}</div>
                  <div className="text-base font-bold -mt-0.5">{t.ctaAppStore}</div>
                </div>
              </a>
              <a href="#" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-calx-text text-calx-bg font-bold rounded-2xl hover:bg-calx-text-secondary hover:scale-105 transition-all shadow-lg shadow-white/10">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.4l2.834 1.641a1 1 0 010 1.732l-2.834 1.642-2.532-2.532 2.532-2.483zM5.864 2.658L16.8 9.291l-2.302 2.302-8.634-8.935z" /></svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-60">{t.ctaPlayStoreLabel}</div>
                  <div className="text-base font-bold -mt-0.5">{t.ctaPlayStore}</div>
                </div>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
