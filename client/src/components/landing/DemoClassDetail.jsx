/**
 * Demo Class Detail Component
 * 
 * Renders ClassDetail views with fake data for the landing page.
 * Supports different tab views: announcements, roster, grades, attendance
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    Megaphone,
    Users,
    ClipboardCheck,
    GraduationCap,
    BarChart3,
    Plus,
    Download,
    Upload,
    Copy,
    UserPlus,
    Trash2,
    Clock,
} from 'lucide-react'
import {
    demoClassroom,
    demoStudents,
    demoAnnouncements,
    demoAssignments,
    demoAttendanceSessions,
    demoStatistics
} from '@/data/demoData'

function getInitials(name) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return formatDate(dateString)
}

// Announcements View
function AnnouncementsView() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Announcements Column */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Announcements</h2>
                    <Button size="sm" className="pointer-events-none">
                        <Plus className="mr-2 h-4 w-4" />
                        New Announcement
                    </Button>
                </div>
                {demoAnnouncements.map((announcement) => (
                    <Card key={announcement.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={announcement.author.picture} />
                                    <AvatarFallback>{getInitials(announcement.author.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{announcement.title}</CardTitle>
                                    <CardDescription className="text-xs">
                                        {announcement.author.name} • {formatRelativeTime(announcement.created_at)}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{announcement.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Class Info */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Class Information</h2>
                <Card>
                    <CardContent className="pt-6 space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Instructor</p>
                            <p className="font-medium">{demoClassroom.instructor.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium break-all">{demoClassroom.instructor.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Term</p>
                            <p className="font-medium">{demoClassroom.term}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Section</p>
                            <p className="font-medium">{demoClassroom.section}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Students</p>
                            <p className="font-medium">{demoClassroom.student_count}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Roster View
function RosterView() {
    return (
        <div className="space-y-4">
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
                    <Button size="sm" className="pointer-events-none">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Major</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoStudents.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={student.picture} />
                                                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium whitespace-nowrap">{student.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                                    <TableCell>{student.major}</TableCell>
                                    <TableCell>{student.grad_year}</TableCell>
                                    <TableCell>
                                        <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap">{student.student_id}</code>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 pointer-events-none">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

// Grades View
function GradesView() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Assignments</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="pointer-events-none">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button size="sm" className="pointer-events-none">
                        <Plus className="mr-2 h-4 w-4" />
                        New Assignment
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
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
                            {demoAssignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">{assignment.title}</TableCell>
                                    <TableCell>
                                        {assignment.due_date
                                            ? formatDate(assignment.due_date)
                                            : '-'
                                        }
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
                </div>
            </Card>
        </div>
    )
}

// Attendance View
function AttendanceView() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Attendance Sessions</h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="pointer-events-none">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button size="sm" className="pointer-events-none">
                        <Clock className="mr-2 h-4 w-4" />
                        Start Session
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Attendance</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demoAttendanceSessions.map((session) => {
                                const rate = Math.round((session.present_count / session.total_count) * 100);

                                return (
                                    <TableRow key={session.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium whitespace-nowrap">{formatDate(session.date)}</TableCell>
                                        <TableCell>
                                            {session.is_open && (
                                                <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono whitespace-nowrap">{session.code}</code>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={session.is_open ? 'default' : 'secondary'} className="w-16 justify-center">
                                                {session.is_open ? 'Open' : 'Closed'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground whitespace-nowrap">{session.present_count} / {session.total_count}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`${rate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'} font-medium whitespace-nowrap`}>
                                                {rate}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                View details
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}

// Statistics View
function StatisticsView() {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Class Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Students</CardDescription>
                        <CardTitle className="text-3xl">{demoStatistics.total_students}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Attendance Rate</CardDescription>
                        <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                            {demoStatistics.attendance_rate}%
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Average Grade</CardDescription>
                        <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">
                            {demoStatistics.average_grade}%
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">By Major</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Major</TableHead>
                                    <TableHead className="text-right">Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(demoStatistics.by_major).map(([major, count]) => (
                                    <TableRow key={major}>
                                        <TableCell>{major}</TableCell>
                                        <TableCell className="text-right">{count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">By Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead className="text-right">Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(demoStatistics.by_grad_year).map(([year, count]) => (
                                    <TableRow key={year}>
                                        <TableCell>{year}</TableCell>
                                        <TableCell className="text-right">{count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Main Component with Tab Selection
export function DemoClassDetail({ activeTab = 'home' }) {
    return (
        <div className="w-full h-full overflow-hidden bg-background rounded-lg">
            <div className="container max-w-6xl mx-auto px-4 py-6">
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
                <Tabs value={activeTab} className="pointer-events-none">
                    <TabsList>
                        <TabsTrigger value="home">Home</TabsTrigger>
                        <TabsTrigger value="roster">Roster</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                        <TabsTrigger value="grades">Grades</TabsTrigger>
                        <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        {activeTab === 'home' && <AnnouncementsView />}
                        {activeTab === 'roster' && <RosterView />}
                        {activeTab === 'attendance' && <AttendanceView />}
                        {activeTab === 'grades' && <GradesView />}
                        {activeTab === 'statistics' && <StatisticsView />}
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
