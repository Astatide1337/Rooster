/**
 * DemoClassDetailPuppet - Controllable ClassDetail for Scroll Demos
 * 
 * Cursor positions calibrated from screenshot analysis.
 * - Add Student button: ~84% x, ~50% y
 * - Modal inputs: centered ~50% x
 * - Modal action buttons: ~77% x, ~85% y
 */

import { useMotionValueEvent, motion } from 'framer-motion'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ArrowLeft,
    UserPlus,
    Plus,
    Download,
    Upload,
    Copy,
    Trash2,
    Check,
} from 'lucide-react'
import { demoClassroom, demoStudents, demoAssignments } from '@/data/demoData'
import { PuppetCursor } from './PuppetCursor'

function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
}

function getTypedText(fullText, progress, startPct, endPct) {
    if (progress < startPct) return ''
    if (progress >= endPct) return fullText
    const pct = (progress - startPct) / (endPct - startPct)
    return fullText.slice(0, Math.floor(pct * fullText.length))
}

export function DemoClassDetailPuppet({ scrollProgress, activePhase, hideCursor = false }) {
    // State for typed values
    const [studentNameValue, setStudentNameValue] = useState('')
    const [studentEmailValue, setStudentEmailValue] = useState('')
    const [assignmentTitleValue, setAssignmentTitleValue] = useState('')
    const [assignmentPointsValue, setAssignmentPointsValue] = useState('')
    const [gradeValueText, setGradeValueText] = useState('')
    const [feedbackValue, setFeedbackValue] = useState('')
    const [showNewStudentValue, setShowNewStudentValue] = useState(false)
    const [showNewAssignmentValue, setShowNewAssignmentValue] = useState(false)
    const [addStudentDialogOpenValue, setAddStudentDialogOpenValue] = useState(false)
    const [createAssignmentDialogOpenValue, setCreateAssignmentDialogOpenValue] = useState(false)
    const [gradingSheetOpenValue, setGradingSheetOpenValue] = useState(false)
    const [showSaveSuccessValue, setShowSaveSuccessValue] = useState(false)

    // Cursor state
    const [cursorPos, setCursorPos] = useState({ x: 50, y: 20 })
    const [cursorVisible, setCursorVisible] = useState(false)
    const [isClicking, setIsClicking] = useState(false)

    const isRosterPhase = activePhase === 'roster'
    const isGradesPhase = activePhase === 'grades'

    useMotionValueEvent(scrollProgress, "change", (p) => {
        // ========================================
        // ROSTER PHASE (33% - 66%) - STAGGERED TIMING
        // ========================================
        // 33-36%: Idle/transition in
        // 36-38%: Cursor moves to Add Student button
        // 38-40%: Click animation
        // 40-41%: Dialog appears (AFTER click)
        // 41-43%: Cursor moves to Name input
        // 43-44%: Cursor on Name input (waiting)
        // 44-50%: Typing name
        // 50-51%: Cursor moves to Email input
        // 51-52%: Cursor on Email input (waiting)
        // 52-57%: Typing email
        // 57-59%: Cursor moves to Add Student button
        // 59-61%: Click animation
        // 61-62%: Dialog closes (AFTER click), student appears
        // 62-66%: Transition to grades

        // Dialog opens AFTER click (40%) and closes AFTER click (61%)
        setAddStudentDialogOpenValue(p >= 0.40 && p < 0.61)
        // Typing starts AFTER cursor is on input
        setStudentNameValue(getTypedText('Emma Thompson', p, 0.44, 0.50))
        setStudentEmailValue(getTypedText('emma.t@student.edu', p, 0.52, 0.57))
        setShowNewStudentValue(p >= 0.61)

        // ========================================
        // GRADES PHASE (66% - 100%) - STAGGERED TIMING
        // ========================================
        // 66-68%: Idle/transition in
        // 68-70%: Cursor moves to New Assignment button
        // 70-72%: Click animation
        // 72-73%: Dialog appears (AFTER click)
        // 73-74%: Cursor moves to Title input
        // 74-75%: Cursor on Title input (waiting)
        // 75-78%: Typing title
        // 78-79%: Cursor moves to Points input
        // 79-80%: Typing points
        // 80-82%: Cursor moves to Create button
        // 82-84%: Click animation
        // 84-85%: Dialog closes (AFTER click), assignment appears
        // 85-87%: Cursor moves to Grade button
        // 87-89%: Click animation
        // 89-90%: Sheet opens (AFTER click)
        // 90-91%: Cursor moves to Score input
        // 91-94%: Typing score
        // 94-95%: Cursor moves to Feedback
        // 95-97%: Typing feedback
        // 97-98%: Cursor moves to Save Grade
        // 98-99%: Click animation
        // 99-100%: Success indicator appears

        // Staggered UI states
        setCreateAssignmentDialogOpenValue(p >= 0.72 && p < 0.84)
        setAssignmentTitleValue(getTypedText('Homework 1', p, 0.75, 0.78))
        setAssignmentPointsValue(getTypedText('100', p, 0.79, 0.80))
        setShowNewAssignmentValue(p >= 0.84)
        setGradingSheetOpenValue(p >= 0.89)
        setGradeValueText(getTypedText('95', p, 0.91, 0.94))
        setFeedbackValue(getTypedText('Excellent work! Great problem-solving skills.', p, 0.95, 0.97))
        setShowSaveSuccessValue(p >= 0.99)

        // Cursor visibility
        setCursorVisible(!hideCursor && p >= 0.34 && p < 1.0)

        // Click states - specific click moments
        setIsClicking(
            (p >= 0.38 && p < 0.40) || // Add Student button
            (p >= 0.59 && p < 0.61) || // Add Student dialog button
            (p >= 0.70 && p < 0.72) || // New Assignment button
            (p >= 0.82 && p < 0.84) || // Create button
            (p >= 0.87 && p < 0.89) || // Grade button
            (p >= 0.98 && p < 0.99)    // Save Grade button
        )

        // ========================================
        // CURSOR POSITIONS - keeping user's calibrated values
        // ========================================

        // ROSTER PHASE
        if (p < 0.36) {
            setCursorPos({ x: 50, y: 30 })
        } else if (p < 0.41) {
            // At "Add Student" button (move + click + wait for dialog)
            setCursorPos({ x: 84, y: 45 })
        } else if (p < 0.50) {
            // At Name field (move + wait + type)
            setCursorPos({ x: 50, y: 45 })
        } else if (p < 0.57) {
            // At Email field (move + wait + type)
            setCursorPos({ x: 50, y: 60 })
        } else if (p < 0.62) {
            // At "Add Student" dialog button (move + click + wait)
            setCursorPos({ x: 77, y: 70 })
        } else if (p < 0.66) {
            // Idle before grades phase
            setCursorPos({ x: 50, y: 50 })
        }
        // GRADES PHASE
        else if (p < 0.68) {
            setCursorPos({ x: 50, y: 25 })
        } else if (p < 0.73) {
            // At "New Assignment" button (move + click + wait)
            setCursorPos({ x: 84, y: 45 })
        } else if (p < 0.78) {
            // At Title input (move + wait + type)
            setCursorPos({ x: 50, y: 42 })
        } else if (p < 0.82) {
            // At Points input (move + type) + Create button
            setCursorPos({ x: 50, y: 57 })
        } else if (p < 0.85) {
            // At "Create" button (move + click)
            setCursorPos({ x: 77, y: 70 })
        } else if (p < 0.90) {
            // At "Grade" button (move + click + wait)
            setCursorPos({ x: 85, y: 70 })
        } else if (p < 0.94) {
            // At Score input (move + wait + type)
            setCursorPos({ x: 45, y: 40 })
        } else if (p < 0.97) {
            // At Feedback (move + type)
            setCursorPos({ x: 65, y: 52 })
        } else if (p < 1.0) {
            // At "Save Grade" button (move + click + success)
            setCursorPos({ x: 35, y: 68 })
        }
    })

    return (
        <div className="w-full h-full overflow-hidden bg-background relative">
            {/* Puppet Cursor */}
            <motion.div
                className="absolute z-[60] pointer-events-none"
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
                <div className="mb-4">
                    <Button variant="ghost" size="sm" className="pointer-events-none mb-2 -ml-2">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Classes
                    </Button>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {demoClassroom.term} • Section {demoClassroom.section}
                            </p>
                            <h1 className="text-xl font-bold mt-1">{demoClassroom.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="font-mono">
                                    {demoClassroom.join_code}
                                </Badge>
                                <Button variant="ghost" size="icon" className="h-6 w-6 pointer-events-none">
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={isRosterPhase ? 'roster' : 'grades'} className="pointer-events-none">
                    <TabsList>
                        <TabsTrigger value="home">Home</TabsTrigger>
                        <TabsTrigger value="roster" className={isRosterPhase ? 'data-[state=active]:bg-background' : ''}>Roster</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="grades" className={isGradesPhase ? 'data-[state=active]:bg-background' : ''}>Grades</TabsTrigger>
                        <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Roster Tab Content */}
                {isRosterPhase && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Roster ({demoStudents.length} students)</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="pointer-events-none">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import
                                </Button>
                                <Button variant="outline" size="sm" className="pointer-events-none">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                <Button size="sm" className="pointer-events-none" id="add-student-btn">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Student
                                </Button>
                            </div>
                        </div>

                        <Card className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Major</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* New student row */}
                                    <tr
                                        className={cn(
                                            "border-b bg-green-500/10 transition-all duration-300",
                                            showNewStudentValue ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                                        )}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src="https://ui-avatars.com/api/?name=Emma+Thompson&background=10b981&color=fff" />
                                                    <AvatarFallback>ET</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">Emma Thompson</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">emma.t@student.edu</TableCell>
                                        <TableCell>Computer Science</TableCell>
                                        <TableCell>2027</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 pointer-events-none">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </tr>
                                    {demoStudents.slice(0, 4).map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={student.picture} />
                                                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{student.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                            <TableCell>{student.major}</TableCell>
                                            <TableCell>{student.grad_year}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 pointer-events-none">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}

                {/* Grades Tab Content */}
                {isGradesPhase && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Assignments</h2>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="pointer-events-none">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                                <Button size="sm" className="pointer-events-none" id="new-assignment-btn">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Assignment
                                </Button>
                            </div>
                        </div>

                        <Card className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {/* New assignment row */}
                                    <tr
                                        className={cn(
                                            "border-b bg-green-500/10 transition-all duration-300",
                                            showNewAssignmentValue ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                                        )}
                                    >
                                        <TableCell className="font-medium">Homework 1</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>100</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="pointer-events-none" id="grade-btn">
                                                Grade
                                            </Button>
                                        </TableCell>
                                    </tr>
                                    {demoAssignments.slice(0, 2).map((assignment) => (
                                        <TableRow key={assignment.id}>
                                            <TableCell className="font-medium">{assignment.title}</TableCell>
                                            <TableCell>
                                                {assignment.due_date
                                                    ? new Date(assignment.due_date).toLocaleDateString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{assignment.points_possible}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" className="pointer-events-none">
                                                    Grade
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                )}
            </div>

            {/* Add Student Dialog */}
            {isRosterPhase && (
                <div
                    className={cn(
                        "absolute inset-0 z-40 transition-opacity duration-300",
                        addStudentDialogOpenValue ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">Add Student</h2>
                                <p className="text-sm text-muted-foreground">Manually add a student to this class.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Name</Label>
                                    <Input
                                        placeholder="Student name"
                                        className="pointer-events-none"
                                        value={studentNameValue}
                                        readOnly
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        placeholder="Email"
                                        className="pointer-events-none"
                                        value={studentEmailValue}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" className="pointer-events-none">Cancel</Button>
                                <Button className="pointer-events-none">Add Student</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Assignment Dialog */}
            {isGradesPhase && (
                <div
                    className={cn(
                        "absolute inset-0 z-40 transition-opacity duration-300",
                        createAssignmentDialogOpenValue ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    )}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold">Create Assignment</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="Assignment title"
                                        className="pointer-events-none"
                                        value={assignmentTitleValue}
                                        readOnly
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Points Possible</Label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        className="pointer-events-none"
                                        value={assignmentPointsValue}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" className="pointer-events-none">Cancel</Button>
                                <Button className="pointer-events-none">Create</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grading Sheet */}
            {isGradesPhase && (
                <div
                    className={cn(
                        "absolute top-0 right-0 bottom-0 w-full max-w-lg z-50 bg-background border-l shadow-xl transition-transform duration-300",
                        gradingSheetOpenValue ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="p-6 space-y-6 h-full overflow-y-auto">
                        <div>
                            <h2 className="text-lg font-semibold">Grade: Homework 1</h2>
                            <p className="text-sm text-muted-foreground">Enter scores for each student</p>
                        </div>

                        <div className="space-y-4">
                            {/* First student with animated inputs */}
                            <div className="p-4 border rounded-lg space-y-3 relative">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={demoStudents[0].picture} />
                                        <AvatarFallback>{getInitials(demoStudents[0].name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{demoStudents[0].name}</p>
                                        <p className="text-sm text-muted-foreground">{demoStudents[0].email}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Score</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="pointer-events-none flex-1"
                                            value={gradeValueText}
                                            readOnly
                                        />
                                        <span className="text-muted-foreground">/100</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Feedback</Label>
                                    <Textarea
                                        placeholder="Add feedback..."
                                        rows={2}
                                        className="pointer-events-none resize-none"
                                        value={feedbackValue}
                                        readOnly
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    className={cn(
                                        "pointer-events-none transition-all duration-300",
                                        showSaveSuccessValue && "bg-green-600 hover:bg-green-600"
                                    )}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    {showSaveSuccessValue ? 'Saved!' : 'Save Grade'}
                                </Button>

                                {showSaveSuccessValue && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                        ✓ Saved
                                    </div>
                                )}
                            </div>

                            {/* Other students (static) */}
                            {demoStudents.slice(1, 3).map((student) => (
                                <div key={student.id} className="p-4 border rounded-lg space-y-3 opacity-60">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={student.picture} />
                                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Score</Label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" placeholder="0" className="pointer-events-none flex-1" readOnly />
                                            <span className="text-muted-foreground">/100</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Feedback</Label>
                                        <Textarea
                                            placeholder="Add feedback..."
                                            rows={2}
                                            className="pointer-events-none resize-none"
                                            readOnly
                                        />
                                    </div>
                                    <Button size="sm" className="pointer-events-none">
                                        <Check className="mr-2 h-4 w-4" />
                                        Save Grade
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
