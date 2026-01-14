/**
 * DemoDashboardPuppet - Controllable Dashboard for Scroll Demos
 * 
 * A version of DemoDashboard that accepts scroll progress to control:
 * - Create Class dialog open/close state
 * - Input field values (animated typing)
 * 
 * Based on real Dashboard.jsx styling.
 * Cursor positions calibrated from screenshot analysis.
 */

import { useState } from 'react'
import { useTransform, motion, useMotionValueEvent } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { Plus, LogIn, Copy } from 'lucide-react'
import { demoClasses, demoUser } from '@/data/demoData'
import { PuppetCursor } from './PuppetCursor'

function getTypedText(fullText, progress, startPct, endPct) {
    if (progress < startPct) return ''
    if (progress >= endPct) return fullText
    const pct = (progress - startPct) / (endPct - startPct)
    return fullText.slice(0, Math.floor(pct * fullText.length))
}

export function DemoDashboardPuppet({ scrollProgress, hideCursor = false }) {
    const [dialogOpenValue, setDialogOpenValue] = useState(false)
    const [classNameValue, setClassNameValue] = useState('')
    const [cursorPos, setCursorPos] = useState({ x: 50, y: 20 })
    const [cursorVisible, setCursorVisible] = useState(false)
    const [isClicking, setIsClicking] = useState(false)

    useMotionValueEvent(scrollProgress, "change", (p) => {
        // STAGGERED TIMING - each action on separate scroll beat
        // Phase 1 (Create Class): 0% - 30%
        // 0-4%: Idle
        // 4-6%: Cursor moves to Create Class button
        // 6-8%: Click animation (cursor on button)
        // 8-10%: Dialog appears, cursor still on button
        // 10-12%: Cursor moves to Class Name input
        // 12-14%: Cursor on input (no typing yet)
        // 14-22%: Typing class name
        // 22-24%: Cursor moves to Create button
        // 24-26%: Click animation on Create button
        // 26-28%: Dialog closes
        // 28-30%: Transition to next phase

        // Dialog opens AFTER click (at 9%) and closes AFTER click (at 27%)
        setDialogOpenValue(p >= 0.09 && p < 0.27)

        // Typing starts AFTER cursor reaches input (at 14%)
        setClassNameValue(getTypedText('Introduction to CS', p, 0.14, 0.22))

        // Cursor visibility
        setCursorVisible(!hideCursor && p > 0.02 && p < 0.30)

        // Click states - during specific click moments
        setIsClicking(
            (p >= 0.06 && p < 0.08) || // Clicking "Create Class"
            (p >= 0.24 && p < 0.26)    // Clicking "Create" in modal
        )

        // Cursor positions - staggered movement
        if (p < 0.04) {
            // Idle position
            setCursorPos({ x: 50, y: 30 })
        } else if (p < 0.10) {
            // At "Create Class" button (includes move + click + wait)
            setCursorPos({ x: 82, y: 7 })
        } else if (p < 0.14) {
            // Moving to class name input and waiting
            setCursorPos({ x: 50, y: 35 })
        } else if (p < 0.22) {
            // Typing in class name field
            setCursorPos({ x: 50, y: 35 })
        } else if (p < 0.28) {
            // At "Create" button (includes move + click + wait)
            setCursorPos({ x: 77, y: 82 })
        } else {
            // Transition out
            setCursorPos({ x: 50, y: 50 })
        }
    })

    return (
        <div className="w-full h-full overflow-hidden bg-background relative">
            {/* Puppet Cursor */}
            <motion.div
                className="absolute z-50 pointer-events-none"
                animate={{
                    left: `${cursorPos.x}%`,
                    top: `${cursorPos.y}%`,
                    opacity: cursorVisible ? 1 : 0,
                    scale: isClicking ? 0.9 : 1
                }}
                transition={{
                    type: 'spring',
                    stiffness: 150,
                    damping: 20,
                    opacity: { duration: 0.15 },
                    scale: { duration: 0.1 }
                }}
            >
                <PuppetCursor x={0} y={0} visible={true} clicking={isClicking} />
            </motion.div>

            <div className="w-full max-w-[600px] px-8 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">My Classes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="pointer-events-none">
                            <LogIn className="mr-2 h-4 w-4" />
                            Join Class
                        </Button>
                        <Button size="sm" className="pointer-events-none" id="create-class-btn">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Class
                        </Button>
                    </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoClasses.slice(0, 3).map((classItem) => (
                        <Card key={classItem.id} className="cursor-default">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <CardDescription className="text-xs uppercase tracking-wide">
                                        {classItem.term}
                                    </CardDescription>
                                    {classItem.is_instructor && <Badge variant="secondary">Instructor</Badge>}
                                </div>
                                <CardTitle className="text-lg">{classItem.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {classItem.section && `Section ${classItem.section} • `}
                                    {classItem.instructor_name}
                                </p>
                                {classItem.join_code && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {classItem.join_code}
                                        </code>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 pointer-events-none">
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Create Class Dialog */}
            <div
                className={cn(
                    "absolute inset-0 z-40 transition-opacity duration-300",
                    dialogOpenValue ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            >
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Create New Class</h2>
                            <p className="text-sm text-muted-foreground">Add a new class to your roster.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="puppet-name">Class Name</Label>
                                <Input
                                    id="puppet-name"
                                    placeholder="e.g., Introduction to Computer Science"
                                    className="pointer-events-none"
                                    value={classNameValue}
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="puppet-term">Term</Label>
                                <Input
                                    id="puppet-term"
                                    value="Spring 2026"
                                    readOnly
                                    className="pointer-events-none"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="puppet-section">Section (optional)</Label>
                                <Input
                                    id="puppet-section"
                                    placeholder="e.g., 001"
                                    className="pointer-events-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" className="pointer-events-none">Cancel</Button>
                            <Button className="pointer-events-none" id="create-btn">Create</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
