import { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { DemoDashboardPuppet } from './DemoDashboardPuppet'
import { DemoClassDetailPuppet } from './DemoClassDetailPuppet'
import { Badge } from '@/components/ui/badge'

export function MobileDemoShowcase() {
    const progress = useMotionValue(0)
    const [activePhase, setActivePhase] = useState('create') // create, roster, grades

    // Animation loop
    useEffect(() => {
        const duration = 12000 // 12 seconds full loop
        let startTime = null
        let animationFrame

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime

            // Progress from 0 to 1
            const p = (elapsed % duration) / duration
            progress.set(p)

            // Determine active phase for UI indicators
            if (p < 0.33) {
                setActivePhase('create')
            } else if (p < 0.66) {
                setActivePhase('roster')
            } else {
                setActivePhase('grades')
            }

            animationFrame = requestAnimationFrame(animate)
        }

        animationFrame = requestAnimationFrame(animate)

        return () => cancelAnimationFrame(animationFrame)
    }, [progress])

    // Derived transforms for crossfading
    const dashboardOpacity = useTransform(progress, [0, 0.28, 0.32], [1, 1, 0])
    const classDetailOpacity = useTransform(progress, [0.28, 0.32, 0.95, 1], [0, 1, 1, 0])

    // Scale effect for the active card
    const scale = useTransform(progress, [0.28, 0.32], [1, 0.95])
    const scaleInverse = useTransform(progress, [0.28, 0.32], [0.95, 1])

    return (
        <div className="w-full py-12 px-4 bg-muted/30">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                    <Badge variant="outline" className="mb-2">
                        {activePhase === 'create' && "1. Create Class"}
                        {activePhase === 'roster' && "2. Manage Roster"}
                        {activePhase === 'grades' && "3. Grade Assignments"}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                        Watch how Rooster automates your workflow
                    </p>
                </div>

                <div className="relative aspect-[4/5] w-full bg-background rounded-xl border shadow-2xl overflow-hidden">
                    {/* Dashboard Puppet */}
                    <motion.div
                        className="absolute inset-0 z-10"
                        style={{ opacity: dashboardOpacity, scale }}
                    >
                        <DemoDashboardPuppet scrollProgress={progress} hideCursor={true} />
                    </motion.div>

                    {/* Class Detail Puppet */}
                    <motion.div
                        className="absolute inset-0 z-20"
                        style={{ opacity: classDetailOpacity, scale: scaleInverse }}
                    >
                        <DemoClassDetailPuppet
                            scrollProgress={progress}
                            hideCursor={true}
                            activePhase={activePhase === 'grades' ? 'grades' : 'roster'}
                        />
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                        <motion.div
                            className="h-full bg-primary"
                            style={{ width: useTransform(progress, p => `${p * 100}%`) }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
