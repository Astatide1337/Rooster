/**
 * Demo Carousel Component
 * 
 * A stunning animated carousel that cycles through different app views.
 * Uses Framer Motion for smooth transitions and perspective effects.
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DemoDashboard } from './DemoDashboard'
import { DemoClassDetail } from './DemoClassDetail'

// Define the views to cycle through
const views = [
    { id: 'dashboard', label: 'Dashboard', component: <DemoDashboard /> },
    { id: 'announcements', label: 'Announcements', component: <DemoClassDetail activeTab="home" /> },
    { id: 'roster', label: 'Roster', component: <DemoClassDetail activeTab="roster" /> },
    { id: 'attendance', label: 'Attendance', component: <DemoClassDetail activeTab="attendance" /> },
    { id: 'grades', label: 'Grades', component: <DemoClassDetail activeTab="grades" /> },
    { id: 'statistics', label: 'Statistics', component: <DemoClassDetail activeTab="statistics" /> },
]

// Animation variants for the container
const containerVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1], // Custom easing for smooth feel
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -20,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        }
    }
}

export function DemoCarousel({ autoPlay = true, interval = 5000 }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    // Auto-advance carousel
    useEffect(() => {
        if (!autoPlay || isPaused) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % views.length)
        }, interval)

        return () => clearInterval(timer)
    }, [autoPlay, interval, isPaused])

    const currentView = views[currentIndex]

    return (
        <div
            className="relative w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* View Indicator Pills */}
            <div className="flex justify-center gap-2 mb-6">
                {views.map((view, index) => (
                    <button
                        key={view.id}
                        onClick={() => setCurrentIndex(index)}
                        className={`
              px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300
              ${index === currentIndex
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80'
                            }
            `}
                    >
                        {view.label}
                    </button>
                ))}
            </div>

            {/* Main Carousel Container with Perspective */}
            <div
                className="relative mx-auto"
                style={{
                    perspective: '2000px',
                    maxWidth: '1200px',
                }}
            >
                {/* Glow Effect Behind */}
                <div
                    className="absolute inset-0 blur-3xl opacity-30"
                    style={{
                        background: 'radial-gradient(ellipse at center, rgba(225, 54, 52, 0.4) 0%, transparent 70%)',
                        transform: 'translateY(20%) scale(1.2)',
                    }}
                />

                {/* The Animated Card */}
                <motion.div
                    className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                    style={{
                        background: 'linear-gradient(180deg, rgba(17, 17, 17, 0.9) 0%, rgba(0, 0, 0, 0.95) 100%)',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                    }}
                    initial={{ rotateX: 10 }}
                    animate={{
                        rotateX: isPaused ? 0 : 5,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    {/* Browser Chrome */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/50">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <div className="flex-1 mx-4">
                            <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-white/40 text-center">
                                rooster.app/{currentView.id}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="relative h-[500px] md:h-[600px] overflow-y-auto scrollbar-hide">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentView.id}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="w-full"
                            >
                                {currentView.component}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Progress Bar */}
                <div className="mt-6 mx-auto max-w-md">
                    <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-rose-500 to-red-600"
                            style={{ background: 'linear-gradient(90deg, #e13634 0%, #f87171 100%)' }}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{
                                duration: interval / 1000,
                                ease: 'linear',
                                repeat: Infinity,
                            }}
                            key={currentIndex} // Reset animation on view change
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
