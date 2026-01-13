/**
 * Demo Dashboard Component
 * 
 * Renders the Dashboard with fake data for the landing page.
 * This is a visual-only component - clicks are disabled.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, LogIn, Copy } from 'lucide-react'
import { demoClasses, demoUser } from '@/data/demoData'

export function DemoDashboard() {
    return (
        <div className="w-full h-full overflow-hidden bg-background rounded-lg">
            <div className="container max-w-6xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold">My Classes</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="pointer-events-none">
                            <LogIn className="mr-2 h-4 w-4" />
                            Join Class
                        </Button>
                        {demoUser.role === 'instructor' && (
                            <Button size="sm" className="pointer-events-none">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Class
                            </Button>
                        )}
                    </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {demoClasses.map((classItem, index) => (
                        <Card
                            key={classItem.id}
                            className="cursor-default card-hover"
                            style={{ animationDelay: `${index * 0.1}s` }}
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
                                            className="h-6 w-6 pointer-events-none"
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
            </div>
        </div>
    )
}
