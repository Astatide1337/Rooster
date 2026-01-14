/**
 * Landing Page - Linear.app Inspired Design
 * 
 * A stunning, dark-themed landing page with:
 * - Animated gradient background
 * - Hero section with animated entrance
 * - Live demo carousel showing real app components
 * - Feature showcases with scroll animations
 * - Direct Google OAuth login
 */

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'
import { DemoCarousel } from '@/components/landing/DemoCarousel'
import {
  ArrowRight,
} from 'lucide-react'
import { LayoutTextFlip } from '@/components/ui/layout-text-flip'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BentoGridFeatures } from '@/components/landing/BentoGridFeatures'
import { ScrollFeatureSection } from '@/components/landing/ScrollFeatureSection'
import { MobileDemoShowcase } from '@/components/landing/MobileDemoShowcase'


// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export default function Home() {
  const { resolvedTheme } = useTheme()
  const iconSrc = '/RoosterDark.ico' // Forced dark mode icon for landing page
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  const handleGoogleLogin = () => {
    window.location.href = '/auth'
  }

  return (
    <div className="dark min-h-screen bg-black text-foreground" style={{ colorScheme: 'dark' }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={iconSrc} alt="Rooster" className="h-8 w-8" />
              <span className="font-semibold text-lg">Rooster</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleGoogleLogin}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Gradient Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] opacity-80 dark:opacity-100"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(225, 54, 52, 0.15) 0%, transparent 60%)',
          }}
        />
        {/* Secondary gradient */}
        <div
          className="absolute top-1/3 right-0 w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle at center, rgba(225, 54, 52, 0.15) 0%, transparent 50%)',
          }}
        />
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-start pt-32 px-4 pb-20"
      >
        <motion.div
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto relative z-10 pointer-events-none"
        >
          {/* Main Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 pointer-events-auto"
          >
            Manage your classroom
            <div className="mt-8">
              <LayoutTextFlip
                text=""
                words={['effortlessly.', 'efficiently.', 'confidently.', 'seamlessly.']}
                className="bg-neutral-900 text-white/50 shadow-white/10 ring-white/10 border-white/10"
              />
            </div>
          </motion.h1>

          {/* Subtitle */}
          <TextGenerateEffect
            words="The all in one platform for rosters, grades, and attendance. Designed for educators."
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-8"
          />

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 pointer-events-auto">
            <Button
              size="lg"
              className="h-10 px-6 text-base bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
              onClick={handleGoogleLogin}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Integrated Hero Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-6xl mx-auto relative z-0 -mt-12 perspective-[1000px] group"
        >
          <div className="relative rounded-xl border border-white/10 bg-black/50 overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm transition-all duration-700 ease-out transform [transform-style:preserve-3d] [transform:rotateX(76deg)] group-hover:[transform:rotateX(0deg)]">
            <DemoCarousel autoPlay={true} interval={5000} />
          </div>

          {/* Bottom Fade Mask - Reduced height */}
          <div className="absolute -bottom-1 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20" />
        </motion.div>
      </section>

      {/* ===== FEATURE SECTIONS ===== */}

      <section id="features" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-32">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">Features</h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto text-center">
            Learn how to use Rooster to manage your classroom.
          </p>
          <BentoGridFeatures />
        </div>
      </section>

      {/* ===== SCROLL-DRIVEN FEATURE DEMOS ===== */}
      <section id="demos" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">See It In Action</h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto text-center">
            Experience the workflows that make Rooster a good choice for educators.
          </p>
        </div>
        <ScrollFeatureSection />
      </section>

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="relative py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Glow effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your classroom?
            </h2>
            <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
              Join instructors who have already simplified their workflow with Rooster.
            </p>
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10"
              onClick={handleGoogleLogin}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-white/[0.02] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={iconSrc} alt="Rooster" className="h-6 w-6 opacity-60" />
            <span className="text-sm text-white/70">© 2026 Rooster. All rights reserved.</span>
          </div>
          <div className="text-sm text-white/70">
            Made with ❤️ for better education.
          </div>
        </div>
      </footer>
    </div >
  )
}
