import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '@/api/apiClient'
import { getInitials } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MajorCombobox } from '@/components/forms/MajorCombobox'
import { GraduationCap, BookUser } from 'lucide-react'

// Smart default: current year + 4 for typical 4-year graduation
const defaultGradYear = new Date().getFullYear() + 4

export default function ProfileSetup({ user, onComplete }) {
  const navigate = useNavigate()
  const isExistingUser = !!user.role
  const [role, setRole] = useState(user.role || 'student')
  const [major, setMajor] = useState(user.major || '')
  const [gradYear, setGradYear] = useState(user.grad_year || defaultGradYear)
  const [studentId, setStudentId] = useState(user.student_id || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {}

    // Only include role for new users (backend will ignore it for existing users anyway)
    if (!isExistingUser) {
      data.role = role
    }

    if (role === 'student') {
      // Validate: require student_id if not yet set
      const needsStudentId = !user.student_id
      if (needsStudentId && !studentId) {
        toast.error("Please fill in your Student ID")
        return
      }
      if (!major || !gradYear) {
        toast.error("Please fill in major and graduation year")
        return
      }
      data.major = major
      data.grad_year = parseInt(gradYear)
      if (needsStudentId) {
        data.student_id = studentId
      }
    } else if (!isExistingUser) {
      data.student_id = 'INSTRUCTOR'
    }

    const success = await updateUser(data)
    if (success) {
      toast.success("Profile updated successfully")
      await onComplete()
      navigate('/')
    } else {
      toast.error("Failed to update profile")
    }
  }

  const RoleIcon = role === 'student' ? GraduationCap : BookUser

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="text-xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">
            {isExistingUser ? 'Account Settings' : 'Welcome to Rooster!'}
          </CardTitle>
          <CardDescription>
            {isExistingUser
              ? 'Update your profile and account preferences.'
              : `We're excited to have you, ${user.name?.split(' ')[0]}! Just a few more details to get your account ready.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection (new users) or Badge (existing users) */}
            {isExistingUser ? (
              <div className="space-y-3">
                <Label>Role</Label>
                <div>
                  <Badge variant="secondary" className="text-sm py-1 px-3">
                    <RoleIcon className="h-4 w-4 mr-1.5" />
                    {role === 'student' ? 'Student' : 'Instructor'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-base">Tell us, are you a...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={role === 'student' ? 'default' : 'outline'}
                    className="h-12 text-sm"
                    onClick={() => setRole('student')}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'instructor' ? 'default' : 'outline'}
                    className="h-12 text-sm"
                    onClick={() => setRole('instructor')}
                  >
                    <BookUser className="mr-2 h-4 w-4" />
                    Instructor
                  </Button>
                </div>
              </div>
            )}

            {/* Account Info (existing users only) */}
            {isExistingUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={user.name || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>
                {role === 'student' && user.student_id && (
                  <div className="space-y-2">
                    <Label>Student ID</Label>
                    <Input value={studentId} disabled className="bg-muted" />
                  </div>
                )}
              </div>
            )}

            {/* Editable Student Fields */}
            {role === 'student' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <MajorCombobox
                    value={major}
                    onValueChange={setMajor}
                    placeholder="Search majors (e.g., 'cs', 'ece')..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradYear">Graduation Year</Label>
                  <Input
                    id="gradYear"
                    type="number"
                    placeholder="e.g., 2027"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                </div>
                {/* Student ID editable if not yet set */}
                {!user.student_id && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="e.g., 12345678"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base">
              {isExistingUser ? 'Save Changes' : 'Create Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
