import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    BookOpen, Users, BarChart3, Plus, Settings, LogOut, Search, Home
} from "lucide-react"

import { useActions } from "@/lib/action-context"

/**
 * Command Palette (⌘K / Ctrl+K)
 * Global quick navigation and actions
 */
export function CommandPalette({ open, onOpenChange, classes = [], onLogout, userRole }) {
    const navigate = useNavigate()
    const { actions, triggerAction } = useActions()

    const runCommand = React.useCallback((command) => {
        onOpenChange(false)
        command()
    }, [onOpenChange])

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search..." className="focus:ring-0 focus:outline-none border-0" />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {actions.length > 0 && (
                    <CommandGroup heading="Context Actions">
                        {actions.map(action => (
                            <CommandItem key={action.id} onSelect={() => runCommand(() => triggerAction(action.id))}>
                                {action.icon && <span className="mr-2 h-4 w-4">{action.icon}</span>}
                                <span>{action.label}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* Only show Create Class for instructors (Global) */}
                {userRole === 'instructor' && (
                    <CommandGroup heading="Global Actions">
                        <CommandItem onSelect={() => runCommand(() => {
                            navigate('/')
                            setTimeout(() => window.dispatchEvent(new CustomEvent('open-create-class')), 200)
                        })}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Create New Class</span>
                        </CommandItem>
                    </CommandGroup>
                )}

                <CommandSeparator />

                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </CommandItem>
                </CommandGroup>

                {classes.length > 0 && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Your Classes">
                            {classes.map((cls) => (
                                <React.Fragment key={cls.id}>
                                    <CommandItem
                                        onSelect={() => runCommand(() => navigate(`/class/${cls.id}`, { state: { classroom: cls } }))}
                                    >
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        <span>{cls.name}</span>
                                        <span className="ml-auto text-xs text-muted-foreground">{cls.term}</span>
                                    </CommandItem>

                                    {/* Sub-navigation for classes */}
                                    <CommandItem
                                        value={`${cls.name} Home`}
                                        onSelect={() => runCommand(() => navigate(`/class/${cls.id}?tab=home`, { state: { classroom: cls } }))}
                                        className="pl-8 text-muted-foreground"
                                    >
                                        <span className="text-xs">Home - {cls.name}</span>
                                    </CommandItem>

                                    {(userRole === 'instructor') && (
                                        <CommandItem
                                            value={`${cls.name} Roster`}
                                            onSelect={() => runCommand(() => navigate(`/class/${cls.id}?tab=roster`, { state: { classroom: cls } }))}
                                            className="pl-8 text-muted-foreground"
                                        >
                                            <span className="text-xs">Roster - {cls.name}</span>
                                        </CommandItem>
                                    )}

                                    <CommandItem
                                        value={`${cls.name} Attendance`}
                                        onSelect={() => runCommand(() => navigate(`/class/${cls.id}?tab=attendance`, { state: { classroom: cls } }))}
                                        className="pl-8 text-muted-foreground"
                                    >
                                        <span className="text-xs">Attendance - {cls.name}</span>
                                    </CommandItem>

                                    <CommandItem
                                        value={`${cls.name} Grades`}
                                        onSelect={() => runCommand(() => navigate(`/class/${cls.id}?tab=grades`, { state: { classroom: cls } }))}
                                        className="pl-8 text-muted-foreground"
                                    >
                                        <span className="text-xs">Grades - {cls.name}</span>
                                    </CommandItem>

                                    {(userRole === 'instructor') && (
                                        <CommandItem
                                            value={`${cls.name} Statistics`}
                                            onSelect={() => runCommand(() => navigate(`/class/${cls.id}?tab=statistics`, { state: { classroom: cls } }))}
                                            className="pl-8 text-muted-foreground"
                                        >
                                            <span className="text-xs">Statistics - {cls.name}</span>
                                        </CommandItem>
                                    )}
                                </React.Fragment>
                            ))}
                        </CommandGroup>
                    </>
                )}

                <CommandSeparator />
                <CommandGroup heading="Account">
                    <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => onLogout?.())}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}