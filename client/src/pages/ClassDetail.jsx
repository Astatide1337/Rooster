import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import {
  getClassroom, getRoster, getAttendanceSessions, createAttendanceSession,
  checkinAttendance, getAssignments, getAttendanceSessionDetails, updateAttendanceSession, deleteClassroom,
  removeStudentFromClass, getClassroomStatistics, addStudentToClass, manualAttendanceCheckin,
  createAssignment, getGrades, updateGrade,
  importRosterCSV, exportRosterCSV, exportAttendanceCSV, exportGradesCSV,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement
} from '@/api/apiClient'
import { getInitials } from '@/lib/utils'
import {
  RosterSkeleton,
  StatsSkeleton,
  AnnouncementSkeleton,
  AttendanceSkeleton,
  AssignmentsSkeleton
} from '@/components/feedback/Skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import {
  Copy, Trash2, CheckCircle, UserMinus, UserPlus,
  Edit, Upload, Download, Megaphone, ArrowLeft, ArrowRight, Clock,
  Plus, Check,
} from 'lucide-react'
import { MajorCombobox } from '@/components/forms/MajorCombobox'

import { useActions } from '@/lib/action-context'

export default function ClassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'

  // Action Context
  const { registerAction, unregisterAction } = useActions()

  const setActiveTab = useCallback((tab) => {
    setSearchParams(prev => {
      prev.set('tab', tab)
      return prev
    })
  }, [setSearchParams])

  // Initialize from location state (optimistic UI) or null
  const [classroom, setClassroom] = useState(location.state?.classroom || null)

  const [roster, setRoster] = useState(null)
  const [attendanceSessions, setAttendanceSessions] = useState(null)
  const [assignments, setAssignments] = useState(null)
  const [stats, setStats] = useState(null)
  const [announcements, setAnnouncements] = useState(null)

  const [checkinCode, setCheckinCode] = useState('')

  // Sheet/Drawer State
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  // Grading Sheet State
  const [gradingSheetOpen, setGradingSheetOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [studentGrades, setStudentGrades] = useState([])

  // Delete Class confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')

  // Remove Student confirmation state
  const [removeStudentDialog, setRemoveStudentDialog] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState(null)

  // Add Student state - with smart default for grad year
  const defaultGradYear = new Date().getFullYear() + 4
  const [addStudentDialog, setAddStudentDialog] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: '', email: '', major: '', grad_year: defaultGradYear, student_id: ''
  })

  // Create Assignment State
  const [createAssignmentDialog, setCreateAssignmentDialog] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', points_possible: '', due_date: ''
  })

  // Announcement State
  const [announcementDialog, setAnnouncementDialog] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' })
  const [deleteAnnouncementDialog, setDeleteAnnouncementDialog] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState(null)

  // Register commands for instructors
  useEffect(() => {
    if (classroom?.is_instructor) {
      registerAction('add-student', 'Add Student', <UserPlus />, () => {
        setActiveTab('roster') // Switch to roster tab for context
        setTimeout(() => setAddStudentDialog(true), 100)
      })
      registerAction('create-assignment', 'Create Assignment', <Plus />, () => {
        setActiveTab('grades') // Switch to grades tab
        setTimeout(() => setCreateAssignmentDialog(true), 100)
      })
      registerAction('post-announcement', 'Post Announcement', <Megaphone />, () => {
        setActiveTab('home') // Switch to home tab
        setAnnouncementForm({ title: '', content: '' }) // Reset form
        setEditingAnnouncement(null)
        setTimeout(() => setAnnouncementDialog(true), 100)
      })
    }

    return () => {
      unregisterAction('add-student')
      unregisterAction('create-assignment')
      unregisterAction('post-announcement')
    }
  }, [classroom?.is_instructor, registerAction, unregisterAction, setActiveTab])



  const fetchData = useCallback(async () => {
    const classroomData = await getClassroom(id)
    if (classroomData.error) {
      toast.error("Failed to load classroom")
      return
    }

    setClassroom(classroomData)

    const promises = [
      getAttendanceSessions(id),
      getAssignments(id),
      getAnnouncements(id)
    ]

    if (classroomData.is_instructor) {
      promises.push(getRoster(id))
      promises.push(getClassroomStatistics(id))
    }

    const results = await Promise.all(promises)

    setAttendanceSessions(Array.isArray(results[0]) ? results[0] : [])
    setAssignments(Array.isArray(results[1]) ? results[1] : [])
    setAnnouncements(Array.isArray(results[2]) ? results[2] : [])

    if (classroomData.is_instructor) {
      setRoster(Array.isArray(results[3]) ? results[3] : [])
      if (results[4] && !results[4].error) {
        setStats(results[4])
      } else {
        setStats(false)
      }
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [fetchData])



  if (!classroom) {
    // Skeleton loading state matching actual ClassDetail layout
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header skeleton - matches back button + title area */}
        <div className="mb-6">
          {/* Back button skeleton */}
          <div className="h-9 w-32 bg-muted rounded mb-2 animate-pulse"></div>

          {/* Title area */}
          <div className="flex items-start justify-between">
            <div>
              {/* Term/Section */}
              <div className="h-4 w-36 bg-muted rounded mb-2 animate-pulse"></div>
              {/* Class name */}
              <div className="h-8 w-64 bg-muted rounded mb-2 animate-pulse"></div>
              {/* Join code badge */}
              <div className="h-6 w-24 bg-muted rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
          {['Home', 'Roster', 'Attendance', 'Grades', 'Statistics'].map((tab, i) => (
            <div key={i} className="h-8 px-4 flex items-center bg-muted rounded animate-pulse">
              <div className="h-3 w-16 bg-muted-foreground/20 rounded"></div>
            </div>
          ))}
        </div>

        {/* Home tab content skeleton - 3 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Announcements column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-40 bg-muted rounded animate-pulse"></div>
              <div className="h-9 w-40 bg-muted rounded animate-pulse"></div>
            </div>
            {/* Announcement cards */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-5 space-y-3 animate-pulse">
                <div className="h-5 w-2/3 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="h-3 w-24 bg-muted rounded mt-2"></div>
              </div>
            ))}
          </div>

          {/* Class Info sidebar (1/3 width) */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-5 space-y-4 animate-pulse">
              <div className="h-5 w-24 bg-muted rounded"></div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded"></div>
                  <div className="h-4 w-12 bg-muted rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-muted rounded"></div>
                  <div className="h-4 w-16 bg-muted rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded"></div>
                  <div className="h-4 w-20 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Announcement handlers
  const handleOpenAnnouncementDialog = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement)
      setAnnouncementForm({ title: announcement.title, content: announcement.content })
    } else {
      setEditingAnnouncement(null)
      setAnnouncementForm({ title: '', content: '' })
    }
    setAnnouncementDialog(true)
  }

  const handleSaveAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      toast.error('Title and content are required')
      return
    }

    let res
    if (editingAnnouncement) {
      res = await updateAnnouncement(editingAnnouncement.id, announcementForm)
    } else {
      res = await createAnnouncement(id, announcementForm)
    }

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(editingAnnouncement ? 'Announcement updated' : 'Announcement posted')
      setAnnouncementDialog(false)
      setAnnouncementForm({ title: '', content: '' })
      setEditingAnnouncement(null)
      fetchData()
    }
  }

  const handleDeleteAnnouncementConfirm = async () => {
    if (!announcementToDelete) return
    const res = await deleteAnnouncement(announcementToDelete.id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Announcement deleted')
      fetchData()
    }
    setDeleteAnnouncementDialog(false)
    setAnnouncementToDelete(null)
  }

  // Assignment handlers
  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.points_possible) {
      toast.error('Title and points are required')
      return
    }
    const payload = {
      ...newAssignment,
      points_possible: Number(newAssignment.points_possible),
      due_date: newAssignment.due_date || null
    }
    const res = await createAssignment(id, payload)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Assignment created')
      setCreateAssignmentDialog(false)
      setNewAssignment({ title: '', description: '', points_possible: '', due_date: '' })
      fetchData()
    }
  }

  const handleOpenGrading = async (assignment) => {
    if (!classroom.is_instructor) return
    setSelectedAssignment(assignment)

    const grades = await getGrades(assignment.id)
    const gradesList = Array.isArray(grades) ? grades : []

    const merged = roster.map(student => {
      const grade = gradesList.find(g => g.student_id === student.id)
      return {
        ...student,
        score: grade ? grade.score : '',
        feedback: grade ? grade.feedback : ''
      }
    })

    setStudentGrades(merged)
    setGradingSheetOpen(true)
  }

  const handleUpdateGrade = (studentId, field, value) => {
    const updated = studentGrades.map(s => {
      if (s.id === studentId) {
        return { ...s, [field]: value }
      }
      return s
    })
    setStudentGrades(updated)
  }

  const handleSaveGrade = async (student) => {
    const res = await updateGrade(selectedAssignment.id, {
      student_id: student.id,
      score: student.score,
      feedback: student.feedback
    })
    if (res.ok) {
      toast.success('Grade saved')
    } else {
      toast.error('Failed to save grade')
    }
  }

  // Attendance handlers
  const handleCreateSession = async () => {
    await createAttendanceSession(id)
    fetchData()
    toast.success('New attendance session started')
  }

  const handleCheckin = async (sessionId) => {
    const res = await checkinAttendance(sessionId, checkinCode)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Checked in successfully!')
      setCheckinCode('')
      fetchData()
    }
  }

  const handleSessionClick = async (session) => {
    if (!classroom.is_instructor) return
    const details = await getAttendanceSessionDetails(session.id)
    setSelectedSession(details)
    setSessionSheetOpen(true)
  }

  const handleToggleSession = async () => {
    if (!selectedSession) return
    const newStatus = !selectedSession.is_open
    await updateAttendanceSession(selectedSession.id, { is_open: newStatus })
    setSelectedSession({ ...selectedSession, is_open: newStatus })
    fetchData()
    toast.info(`Session ${newStatus ? 're-opened' : 'closed'}`)
  }

  const handleManualCheckin = async (studentId) => {
    if (!selectedSession) return
    const res = await manualAttendanceCheckin(selectedSession.id, studentId, 'present')
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Marked present')
      const details = await getAttendanceSessionDetails(selectedSession.id)
      setSelectedSession(details)
      fetchData()
    }
  }

  // Class management handlers
  const handleDeleteConfirm = async () => {
    if (deleteConfirmName !== classroom.name) {
      toast.error('Class name does not match')
      return
    }
    const res = await deleteClassroom(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      navigate('/')
    }
  }

  const handleRemoveStudentConfirm = async () => {
    if (!studentToRemove) return
    const res = await removeStudentFromClass(id, studentToRemove.id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Student removed from class')
      fetchData()
    }
    setRemoveStudentDialog(false)
    setStudentToRemove(null)
  }

  const handleAddStudent = async () => {
    const res = await addStudentToClass(id, newStudent)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Student added successfully')
      setAddStudentDialog(false)
      setNewStudent({ name: '', email: '', major: '', grad_year: defaultGradYear, student_id: '' })
      fetchData()
    }
  }

  const handleImportRoster = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await importRosterCSV(id, formData)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`Successfully added ${res.added} students`)
      fetchData()
    }
    event.target.value = null
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Tab indices for instructor vs student
  const getTabValue = () => {
    if (classroom.is_instructor) {
      return activeTab
    }
    // Students don't have Roster or Statistics tabs
    if (activeTab === 'roster' || activeTab === 'statistics') {
      return 'home'
    }
    return activeTab
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" className="mb-2 -ml-2" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {classroom.term} {classroom.section && `• Section ${classroom.section}`}
            </p>
            <h1 className="text-2xl font-bold mt-1 break-words">{classroom.name}</h1>
            {classroom.is_instructor && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="font-mono">
                  {classroom.join_code}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(classroom.join_code)}
                  aria-label="Copy join code"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {classroom.is_instructor && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive w-full sm:w-auto"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Class
            </Button>
          )}        </div>
      </div>

      {/* Tabs */}
      <Tabs value={getTabValue()} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto pb-4 -mb-2 scrollbar-hide">
          <TabsList className="w-max inline-flex">
            <TabsTrigger value="home">Home</TabsTrigger>
            {classroom.is_instructor && <TabsTrigger value="roster">Roster</TabsTrigger>}
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            {classroom.is_instructor && <TabsTrigger value="statistics">Statistics</TabsTrigger>}
          </TabsList>
        </div>

        {/* Home Tab */}
        <TabsContent value="home" className="mt-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Announcements */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Announcements</h2>
                </div>
                {classroom.is_instructor && (
                  <Button onClick={() => handleOpenAnnouncementDialog()} className="w-full sm:w-auto justify-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Announcement
                  </Button>
                )}
              </div>

              {announcements === null ? (
                <div className="space-y-4">
                  <AnnouncementSkeleton />
                  <AnnouncementSkeleton />
                </div>
              ) : announcements.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No announcements yet</p>
                    {classroom.is_instructor && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Post your first announcement to share updates
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={announcement.author.picture} alt={announcement.author.name} />
                              <AvatarFallback>{getInitials(announcement.author.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{announcement.author.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(announcement.created_at).toLocaleDateString()} at{' '}
                                {new Date(announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {announcement.updated_at && ' (edited)'}
                              </p>
                            </div>
                          </div>
                          {classroom.is_instructor && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenAnnouncementDialog(announcement)}
                                aria-label="Edit announcement"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => { setAnnouncementToDelete(announcement); setDeleteAnnouncementDialog(true) }}
                                aria-label="Delete announcement"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold mb-2">{announcement.title}</h3>
                        <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Class Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Class Information</h2>
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-medium">{classroom.instructor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{classroom.instructor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Term</p>
                    <p className="font-medium">{classroom.term}</p>
                  </div>
                  {classroom.section && (
                    <div>
                      <p className="text-sm text-muted-foreground">Section</p>
                      <p className="font-medium">{classroom.section}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="font-medium">{roster?.length || 0}</p>
                  </div>
                  {classroom.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm mt-1">{classroom.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Roster Tab (Instructor Only) */}
        {classroom.is_instructor && (
          <TabsContent value="roster" className="mt-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">Class Roster ({roster?.length || 0} students)</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => exportRosterCSV(id)} className="w-full sm:w-auto justify-center">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto justify-center">
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                    <input type="file" hidden accept=".csv" onChange={handleImportRoster} />
                  </label>
                </Button>
                <Button onClick={() => setAddStudentDialog(true)} className="w-full sm:w-auto justify-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </div>
            </div>

            {roster === null ? (
              <RosterSkeleton rows={5} />
            ) : roster.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students enrolled yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share the join code or add students manually
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
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
                      {roster.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.picture} alt={student.name} />
                                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                              </Avatar>
                              {student.name}
                            </div>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.major || '-'}</TableCell>
                          <TableCell>{student.grad_year || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => { setStudentToRemove(student); setRemoveStudentDialog(true) }}
                              aria-label="Remove student"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>

                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Attendance Sessions</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {classroom.is_instructor && (
                <>
                  <Button variant="outline" onClick={() => exportAttendanceCSV(id)} className="w-full sm:w-auto justify-center">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button onClick={handleCreateSession} className="w-full sm:w-auto justify-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Start Session
                  </Button>
                </>
              )}
            </div>
          </div>

          {attendanceSessions === null ? (
            <AttendanceSkeleton />
          ) : attendanceSessions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No attendance sessions yet</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop View */}
              <Card className="hidden md:block overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        {classroom.is_instructor && <TableHead>Code</TableHead>}
                        <TableHead>Status</TableHead>
                        {classroom.is_instructor && (
                          <>
                            <TableHead>Attendance</TableHead>
                            <TableHead>Rate</TableHead>
                          </>
                        )}
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceSessions.map((session) => {
                        // Calculate attendance stats
                        const presentCount = session.records?.filter(r => r.status === 'present').length || 0;
                        const totalStudents = roster?.length || 0;
                        const rate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

                        return (
                          <TableRow
                            key={session.id}
                            className={classroom.is_instructor ? 'cursor-pointer hover:bg-muted/50' : ''}
                            onClick={() => handleSessionClick(session)}
                          >
                            <TableCell className="font-medium">
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            {classroom.is_instructor && (
                              <TableCell>
                                {session.is_open && (
                                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{session.code}</code>
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              <Badge variant={session.is_open ? 'default' : 'secondary'} className="w-16 justify-center">
                                {session.is_open ? 'Open' : 'Closed'}
                              </Badge>
                            </TableCell>
                            {classroom.is_instructor && (
                              <>
                                <TableCell>
                                  <span className="text-muted-foreground">{presentCount} / {totalStudents}</span>
                                </TableCell>
                                <TableCell>
                                  <span className={`${rate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'} font-medium`}>
                                    {rate}%
                                  </span>
                                </TableCell>
                              </>
                            )}
                            <TableCell className="text-right">
                              {!classroom.is_instructor && session.is_open && (
                                <div className="flex items-center justify-end gap-2">
                                  {session.has_checked_in ? (
                                    <Badge variant="outline" className="text-green-600">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Checked In
                                    </Badge>
                                  ) : (
                                    <>
                                      <Input
                                        placeholder="Code"
                                        value={checkinCode}
                                        onChange={(e) => setCheckinCode(e.target.value.toUpperCase())}
                                        className="w-24 h-8"
                                        maxLength={6}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <Button
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleCheckin(session.id) }}
                                      >
                                        Check In
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                              {!classroom.is_instructor && !session.is_open && (
                                <div className="flex items-center justify-end gap-2">
                                  {session.has_checked_in ? (
                                    <Badge variant="outline" className="text-green-600">
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      Present
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-muted-foreground">
                                      Absent
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {classroom.is_instructor && (
                                <span className="text-sm text-muted-foreground">
                                  View details
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {attendanceSessions.map((session) => {
                  const presentCount = session.records?.filter(r => r.status === 'present').length || 0;
                  const totalStudents = roster?.length || 0;
                  const rate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

                  return (
                    <Card
                      key={session.id}
                      className={classroom.is_instructor ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
                      onClick={() => handleSessionClick(session)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={session.is_open ? 'default' : 'secondary'}>
                                {session.is_open ? 'Open' : 'Closed'}
                              </Badge>
                              {classroom.is_instructor && session.is_open && (
                                <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">{session.code}</code>
                              )}
                            </div>
                          </div>
                          {classroom.is_instructor && (
                            <div className="text-right">
                              <div className={`text-lg font-bold ${rate >= 90 ? 'text-green-600 dark:text-green-400' : ''}`}>
                                {rate}%
                              </div>
                              <p className="text-xs text-muted-foreground">{presentCount}/{totalStudents}</p>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 border-t">
                        {!classroom.is_instructor ? (
                          session.is_open ? (
                            <div className="flex items-center justify-between gap-2">
                              {session.has_checked_in ? (
                                <Badge variant="outline" className="text-green-600 w-full justify-center py-1.5">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Checked In
                                </Badge>
                              ) : (
                                <div className="flex gap-2 w-full">
                                  <Input
                                    placeholder="Code"
                                    value={checkinCode}
                                    onChange={(e) => setCheckinCode(e.target.value.toUpperCase())}
                                    className="flex-1"
                                    maxLength={6}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Button
                                    onClick={(e) => { e.stopPropagation(); handleCheckin(session.id) }}
                                  >
                                    Check In
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full flex justify-center">
                              {session.has_checked_in ? (
                                <Badge variant="outline" className="text-green-600 w-full justify-center py-1.5">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Present
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground w-full justify-center py-1.5">
                                  Absent
                                </Badge>
                              )}
                            </div>
                          )
                        ) : (
                          <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent h-auto text-muted-foreground font-normal">
                            View Details <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* Grades Tab */}
        <TabsContent value="grades" className="mt-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold">Assignments</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {classroom.is_instructor && (
                <>
                  <Button variant="outline" onClick={() => exportGradesCSV(id)} className="w-full sm:w-auto justify-center">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button onClick={() => setCreateAssignmentDialog(true)} className="w-full sm:w-auto justify-center">
                    <Plus className="mr-2 h-4 w-4" />
                    New Assignment
                  </Button>
                </>
              )}
            </div>
          </div>

          {
            assignments === null ? (
              <div className="space-y-4">
                <AssignmentsSkeleton />
              </div>
            ) : assignments.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No assignments yet</p>
                </CardContent>
              </Card>
            ) : classroom.is_instructor ? (
              <>
                {/* Desktop View */}
                <Card className="hidden md:block overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell>
                              {assignment.due_date
                                ? new Date(assignment.due_date).toLocaleDateString()
                                : '-'
                              }
                            </TableCell>
                            <TableCell>{assignment.points_possible}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenGrading(assignment)}
                              >
                                Grade
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{assignment.title}</CardTitle>
                            <CardDescription>
                              Due: {assignment.due_date
                                ? new Date(assignment.due_date).toLocaleDateString()
                                : 'No due date'
                              }
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{assignment.points_possible} pts</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleOpenGrading(assignment)}
                        >
                          Grade Assignment
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              /* Student view with feedback */
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{assignment.title}</CardTitle>
                          <CardDescription>
                            Due: {assignment.due_date
                              ? new Date(assignment.due_date).toLocaleDateString()
                              : 'No due date'
                            }
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          {assignment.score !== undefined && assignment.score !== null ? (
                            <div>
                              <span className="text-2xl font-bold">{assignment.score}</span>
                              <span className="text-muted-foreground">/{assignment.points_possible}</span>
                            </div>
                          ) : (
                            <Badge variant="secondary">Not graded</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {assignment.feedback && (
                      <CardContent className="pt-2 border-t">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Instructor Feedback</p>
                          <p className="text-sm whitespace-pre-wrap">{assignment.feedback}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )
          }
        </TabsContent>

        {/* Statistics Tab (Instructor Only) */}
        {
          classroom.is_instructor && (
            <TabsContent value="statistics" className="mt-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Class Statistics</h2>

              {stats === null ? ( // Loading state
                <StatsSkeleton />
              ) : stats ? ( // Data available
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Total Students</CardDescription>
                        <CardTitle className="text-3xl">{stats.total_students}</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Attendance Rate</CardDescription>
                        <CardTitle className="text-3xl text-green-600 dark:text-green-400">{stats.attendance_rate}%</CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Average Grade</CardDescription>
                        <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">{stats.average_grade}%</CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Distribution Tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">By Major</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stats.major_distribution && Object.keys(stats.major_distribution).length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Major</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(stats.major_distribution).map(([major, count], i) => (
                                <TableRow key={i}>
                                  <TableCell>{major}</TableCell>
                                  <TableCell className="text-right">{count}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-sm">No data</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">By Year</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {stats.year_distribution && Object.keys(stats.year_distribution).length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Year</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(stats.year_distribution).map(([year, count], i) => (
                                <TableRow key={i}>
                                  <TableCell>{year}</TableCell>
                                  <TableCell className="text-right">{count}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-sm">No data</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground">No statistics available</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        }
      </Tabs >

      {/* Announcement Dialog */}
      < Dialog open={announcementDialog} onOpenChange={setAnnouncementDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                rows={6}
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveAnnouncement}>
              {editingAnnouncement ? 'Save Changes' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Delete Announcement Dialog */}
      < Dialog open={deleteAnnouncementDialog} onOpenChange={setDeleteAnnouncementDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{announcementToDelete?.title}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAnnouncementDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAnnouncementConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Create Assignment Dialog */}
      < Dialog open={createAssignmentDialog} onOpenChange={setCreateAssignmentDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asg-title">Title</Label>
              <Input
                id="asg-title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asg-desc">Description (optional)</Label>
              <Textarea
                id="asg-desc"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asg-points">Points Possible</Label>
              <Input
                id="asg-points"
                type="number"
                value={newAssignment.points_possible}
                onChange={(e) => setNewAssignment({ ...newAssignment, points_possible: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asg-due">Due Date (optional)</Label>
              <Input
                id="asg-due"
                type="date"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateAssignmentDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateAssignment}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Add Student Dialog */}
      < Dialog open={addStudentDialog} onOpenChange={setAddStudentDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Manually add a student to this class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stu-name">Name</Label>
              <Input
                id="stu-name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stu-email">Email</Label>
              <Input
                id="stu-email"
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stu-major">Major</Label>
              <MajorCombobox
                value={newStudent.major}
                onValueChange={(val) => setNewStudent({ ...newStudent, major: val })}
                placeholder="Search majors..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="stu-year">Grad Year</Label>
                <Input
                  id="stu-year"
                  type="number"
                  value={newStudent.grad_year}
                  onChange={(e) => setNewStudent({ ...newStudent, grad_year: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stu-id">Student ID</Label>
                <Input
                  id="stu-id"
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStudentDialog(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Remove Student Dialog */}
      < Dialog open={removeStudentDialog} onOpenChange={setRemoveStudentDialog} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {studentToRemove?.name} from this class?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveStudentDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemoveStudentConfirm}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Delete Class Dialog */}
      < Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Class</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The class will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive" className="my-4">
            <AlertDescription>
              To confirm, type the class name: <strong>{classroom.name}</strong>
            </AlertDescription>
          </Alert>
          <Input
            placeholder="Class name"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmName !== classroom.name}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Delete Announcement Dialog */}
      <Dialog open={deleteAnnouncementDialog} onOpenChange={setDeleteAnnouncementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{announcementToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAnnouncementDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAnnouncementConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grading Sheet */}
      < Sheet open={gradingSheetOpen} onOpenChange={setGradingSheetOpen} >
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Grade: {selectedAssignment?.title}</SheetTitle>
            <SheetDescription>
              {selectedAssignment?.points_possible} points possible
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {studentGrades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students to grade</p>
            ) : (
              <div className="space-y-6">
                {studentGrades.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.picture} alt={student.name} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`score-${student.id}`}>Score</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`score-${student.id}`}
                            type="number"
                            placeholder="0"
                            value={student.score}
                            onChange={(e) => handleUpdateGrade(student.id, 'score', e.target.value)}
                          />
                          <span className="text-muted-foreground">/{selectedAssignment?.points_possible}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`feedback-${student.id}`}>Feedback</Label>
                      <Textarea
                        id={`feedback-${student.id}`}
                        placeholder="Add feedback for this student..."
                        rows={2}
                        value={student.feedback || ''}
                        onChange={(e) => handleUpdateGrade(student.id, 'feedback', e.target.value)}
                      />
                    </div>
                    <Button size="sm" onClick={() => handleSaveGrade(student)}>
                      <Check className="mr-2 h-4 w-4" />
                      Save Grade
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet >

      {/* Attendance Session Sheet */}
      < Sheet open={sessionSheetOpen} onOpenChange={setSessionSheetOpen} >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              Attendance Session
              {selectedSession && (
                <Badge variant={selectedSession.is_open ? 'default' : 'secondary'}>
                  {selectedSession.is_open ? 'Open' : 'Closed'}
                </Badge>
              )}
            </SheetTitle>
            {selectedSession && (
              <SheetDescription>
                {new Date(selectedSession.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </SheetDescription>
            )}
          </SheetHeader>

          {selectedSession && (
            <div className="py-4">
              <div className="flex items-center justify-between  mb-4 mx-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-mono font-bold tracking-widest">
                    {selectedSession.code}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Session Code</p>
                </div>
                <Button variant="outline" onClick={handleToggleSession}>
                  {selectedSession.is_open ? 'Close Session' : 'Reopen Session'}
                </Button>
              </div>

              <Separator className="my-4" />

              <h4 className="font-medium mb-3 mx-2">
                Students ({selectedSession.records?.filter(a => a.status === 'present').length || 0} / {roster?.length || 0})
              </h4>

              <div className="space-y-2">
                {(roster || []).map((student) => {
                  const attendee = selectedSession.records?.find(a => a.student_id === student.id)
                  const isPresent = attendee?.status === 'present'

                  return (
                    <div key={student.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.picture} alt={student.name} />
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{student.name}</span>
                      </div>
                      {isPresent ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Present
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManualCheckin(student.id)}
                        >
                          Mark Present
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet >
    </div>
  )
}
