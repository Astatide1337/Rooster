import { useState } from 'react'
import { updateUser } from '@/api/apiClient'
import { getInitials } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

export default function ProfileSetup({ user, onComplete }) {
  const [role, setRole] = useState(user.role || 'student')
  const [major, setMajor] = useState(user.major || '')
  const [gradYear, setGradYear] = useState(user.grad_year || '')
  const [studentId, setStudentId] = useState(user.student_id || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { role }
    
    if (role === 'student') {
      if (!major || !gradYear || !studentId) {
        toast.error("Please fill in all fields")
        return
      }
      data.major = major
      data.grad_year = parseInt(gradYear)
      data.student_id = studentId
    } else {
      data.student_id = 'INSTRUCTOR'
    }
    
    const success = await updateUser(data)
    if (success) {
      toast.success("Profile updated successfully")
      onComplete()
    } else {
      toast.error("Failed to update profile")
    }
  }

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
          <CardTitle className="text-2xl">Welcome, {user.name?.split(' ')[0]}!</CardTitle>
          <CardDescription>
            Complete your profile to get started with Rooster.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={role === 'student' ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => setRole('student')}
                >
                  Student
                </Button>
                <Button
                  type="button"
                  variant={role === 'instructor' ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => setRole('instructor')}
                >
                  Instructor
                </Button>
              </div>
            </div>

            {/* Student Fields */}
            {role === 'student' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Input
                    id="major"
                    placeholder="e.g., Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
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
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., 12345678"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12">
              Finish Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
