/**
 * ScrollFeatureSection - Scroll-Driven Feature Demos
 * 
 * A "scrollytelling" section that demonstrates key app workflows:
 * 1. Create a Class
 * 2. Add a Student  
 * 3. Create & Grade an Assignment
 * 
 * Uses Framer Motion's useScroll for sticky scrubbing animation.
 */

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { DemoDashboardPuppet } from './DemoDashboardPuppet'
import { DemoClassDetailPuppet } from './DemoClassDetailPuppet'

// Phases of the scroll animation
const PHASES = [
    {
        id: 'create-class',
        title: 'Create Your First Class',
        description: 'Set up a new course in seconds. Just name it, pick a term, and you\'re ready to go.',
        range: [0, 0.33],
    },
    {
        id: 'add-student',
        title: 'Build Your Roster',
        description: 'Add students manually or import a CSV. They\'ll get a unique join code.',
        range: [0.33, 0.66],
    },
    {
        id: 'grade-assignment',
        title: 'Grade with Ease',
        description: 'Create assignments, enter scores, and provide feedback—all in one place.',
        range: [0.66, 1],
    },
]

export function ScrollFeatureSection() {
    const containerRef = useRef(null)

    // Track scroll progress within this section (0 to 1)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end']
    })

    return (
        <section
            ref={containerRef}
            className="relative"
            style={{ height: '800vh' }}
        >
            {/* Sticky Viewport - Stays pinned during scroll */}
            <div className="sticky top-[10vh] h-[80vh] md:top-0 md:h-screen flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-7xl mx-auto px-4 py-12">
                    {/* Two Column Layout: Captions + Demo */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Phase Captions */}
                        <PhaseCaption scrollProgress={scrollYProgress} />

                        {/* Right: Interactive Demo Viewport */}
                        <DemoViewport scrollProgress={scrollYProgress} />
                    </div>
                </div>
            </div>
        </section>
    )
}

// Sub-component to handle individual phase animations
function PhaseItem({ phase, index, scrollProgress }) {
    const opacity = useTransform(
        scrollProgress,
        [phase.range[0] - 0.05, phase.range[0], phase.range[1] - 0.05, phase.range[1]],
        [0.3, 1, 1, 0.3]
    )
    
    const y = useTransform(
        scrollProgress,
        [phase.range[0], phase.range[1]],
        [0, -20]
    )

    return (
        <motion.div
            className="space-y-3"
            style={{ opacity, y }}
        >
            <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm font-bold">
                    {index + 1}
                </span>
                <h3 className="text-2xl font-bold">{phase.title}</h3>
            </div>
            <p className="text-white/60 text-lg leading-relaxed pl-11">
                {phase.description}
            </p>
        </motion.div>
    )
}

// Phase caption that animates based on scroll progress
function PhaseCaption({ scrollProgress }) {
    return (
        <div className="space-y-8">
            {PHASES.map((phase, index) => (
                <PhaseItem 
                    key={phase.id} 
                    phase={phase} 
                    index={index} 
                    scrollProgress={scrollProgress} 
                />
            ))}

            {/* Progress Indicator */}
            <div className="pl-11 pt-4">
                <div className="h-1 w-full max-w-xs bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-rose-500 to-red-600"
                        style={{
                            scaleX: scrollProgress,
                            transformOrigin: 'left'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

// The demo viewport showing the actual app interface
function DemoViewport({ scrollProgress }) {
    return (
        <div className="relative">
            {/* Browser Chrome Frame */}
            <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl bg-black/50 backdrop-blur-sm">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/50">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/40 text-center">
                            rooster.app
                        </div>
                    </div>
                </div>

                {/* Demo Content Area */}
                <div className="relative h-[500px] overflow-hidden bg-background">
                    <DemoContent scrollProgress={scrollProgress} />
                </div>
            </div>

            {/* Glow Effect */}
            <div
                className="absolute inset-0 -z-10 blur-3xl opacity-20"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(225, 54, 52, 0.5) 0%, transparent 70%)',
                    transform: 'translateY(10%) scale(1.2)',
                }}
            />
        </div>
    )
}

// The actual demo content that changes based on scroll phase
function DemoContent({ scrollProgress }) {
    // Phase ranges with overlapping crossfades to prevent black gaps:
    // Phase 1: 0% to 33% (fade out from 30-36%)
    // Phase 2: 30% to 66% (fade in 30-36%, fade out 60-68%)
    // Phase 3: 60% to 100% (fade in 60-68%)

    return (
        <motion.div className="w-full h-full">
            {/* Phase 1: Dashboard with Create Class modal (0% - 33%) */}
            {/* Fade out from 30-34% to give cursor time to complete actions */}
            <motion.div
                className="absolute inset-0"
                style={{
                    opacity: useTransform(scrollProgress, [0, 0.30, 0.34], [1, 1, 0]),
                    pointerEvents: useTransform(scrollProgress, p => p < 0.33 ? 'auto' : 'none')
                }}
            >
                <DemoDashboardPuppet scrollProgress={scrollProgress} />
            </motion.div>

            {/* Phase 2: ClassDetail Roster tab (33% - 66%) */}
            {/* Fade in 32-35%, fade out 62-66% */}
            <motion.div
                className="absolute inset-0"
                style={{
                    opacity: useTransform(scrollProgress, [0.32, 0.35, 0.62, 0.66], [0, 1, 1, 0]),
                    pointerEvents: useTransform(scrollProgress, p => (p >= 0.33 && p < 0.66) ? 'auto' : 'none')
                }}
            >
                <DemoClassDetailPuppet scrollProgress={scrollProgress} activePhase="roster" />
            </motion.div>

            {/* Phase 3: ClassDetail Grades tab (66% - 100%) */}
            {/* Fade in 64-68% */}
            <motion.div
                className="absolute inset-0"
                style={{
                    opacity: useTransform(scrollProgress, [0.64, 0.68, 1], [0, 1, 1]),
                    pointerEvents: useTransform(scrollProgress, p => p >= 0.66 ? 'auto' : 'none')
                }}
            >
                <DemoClassDetailPuppet scrollProgress={scrollProgress} activePhase="grades" />
            </motion.div>
        </motion.div>
    )
}