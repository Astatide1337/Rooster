import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClassrooms, createClassroom, joinClassroom } from '@/api/apiClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, LogIn, BookOpen, Copy } from 'lucide-react'
import { toast } from 'sonner'

// Smart default: Fall (Aug-Dec) or Spring (Jan-Jul) + current year
const getDefaultTerm = () => {
  const now = new Date()
  const month = now.getMonth() // 0-11
  const year = now.getFullYear()
  return month >= 7 ? `Fall ${year}` : `Spring ${year}` // Aug-Dec = Fall
}

export default function Dashboard({ user }) {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openJoin, setOpenJoin] = useState(false)
  const [newClass, setNewClass] = useState({ name: '', term: getDefaultTerm(), section: '' })
  const [joinCode, setJoinCode] = useState('')
  const navigate = useNavigate()

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    const data = await getClassrooms()
    if (Array.isArray(data)) {
      setClasses(data)
    } else {
      console.error("Failed to fetch classes:", data)
      setClasses([])
    }
    setLoading(false)
  }, [])

  // Listen for command palette "Create Class" action
  useEffect(() => {
    const handler = () => setOpenCreate(true)
    window.addEventListener('open-create-class', handler)
    return () => window.removeEventListener('open-create-class', handler)
  }, [])

  useEffect(() => {
    fetchClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    if (!newClass.name || !newClass.term) {
      toast.error("Name and term are required")
      return
    }
    try {
      const res = await createClassroom(newClass)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`"${newClass.name}" created`, {
          action: {
            label: "Open",
            onClick: () => navigate(`/class/${res.id}`)
          }
        })
        setOpenCreate(false)
        setNewClass({ name: '', term: getDefaultTerm(), section: '' })
        fetchClasses()
      }
    } catch (error) {
      toast.error("Failed to create class: " + error.message)
    }
  }

  const handleJoin = async () => {
    if (!joinCode) {
      toast.error("Please enter a join code")
      return
    }
    try {
      const res = await joinClassroom(joinCode)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Joined "${res.name || 'class'}" successfully`, {
          action: {
            label: "Open",
            onClick: () => navigate(`/class/${res.id}`)
          }
        })
        setOpenJoin(false)
        setJoinCode('')
        fetchClasses()
      }
    } catch (error) {
      toast.error("Failed to join class: " + error.message)
    }
  }

  const copyJoinCode = (code, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    toast.success("Join code copied")
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Classes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenJoin(true)}>
            <LogIn className="mr-2 h-4 w-4" />
            Join Class
          </Button>
          {user.role === 'instructor' && (
            <Button onClick={() => setOpenCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        // Skeleton loading state
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-muted rounded-full w-16"></div>
                  <div className="h-5 bg-muted rounded-full w-20"></div>
                </div>
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card className="text-center py-12 animate-fade-in">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-muted-foreground mb-4">
              {user.role === 'instructor'
                ? "Create your first class to get started"
                : "Join a class using a code from your instructor"
              }
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => setOpenJoin(true)}>
                <LogIn className="mr-2 h-4 w-4" />
                Join Class
              </Button>
              {user.role === 'instructor' && (
                <Button onClick={() => setOpenCreate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Class
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem, index) => (
            <Card
              key={classItem.id}
              className="cursor-pointer card-hover animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigate(`/class/${classItem.id}`)}
            >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => copyJoinCode(classItem.join_code, e)}
                      aria-label="Copy join code"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Add a new class to your roster.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                placeholder="e.g., Introduction to Computer Science"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                placeholder="e.g., Spring 2026"
                value={newClass.term}
                onChange={(e) => setNewClass({ ...newClass, term: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section (optional)</Label>
              <Input
                id="section"
                placeholder="e.g., 001"
                value={newClass.section}
                onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={openJoin} onOpenChange={setOpenJoin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Class</DialogTitle>
            <DialogDescription>
              Enter the 6-character code provided by your instructor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Join Code</Label>
              <Input
                id="code"
                placeholder="e.g., ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg tracking-widest uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenJoin(false)}>
              Cancel
            </Button>
            <Button onClick={handleJoin}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
