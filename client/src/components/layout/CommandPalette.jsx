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

/**
 * Command Palette (⌘K / Ctrl+K)
 * Global quick navigation and actions
 */
export function CommandPalette({ open, onOpenChange, classes = [], onLogout, userRole }) {
    const navigate = useNavigate()

    const runCommand = React.useCallback((command) => {
        onOpenChange(false)
        command()
    }, [onOpenChange])

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Type a command or search..." className="focus:ring-0 focus:outline-none border-0" />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

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
                            {classes.slice(0, 5).map((cls) => (
                                <CommandItem
                                    key={cls.id}
                                    onSelect={() => runCommand(() => navigate(`/class/${cls.id}`))}
                                >
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>{cls.name}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">{cls.term}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </>
                )}

                {/* Only show Create Class for instructors */}
                {userRole === 'instructor' && (
                    <>
                        <CommandSeparator />
                        <CommandGroup heading="Quick Actions">
                            <CommandItem onSelect={() => runCommand(() => {
                                navigate('/')
                                // Wait for navigation to complete, then open dialog
                                setTimeout(() => window.dispatchEvent(new CustomEvent('open-create-class')), 200)
                            })}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span>Create New Class</span>
                            </CommandItem>
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

/**
 * Hook to handle ⌘K / Ctrl+K keyboard shortcut
 */
export function useCommandPalette() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return { open, setOpen }
}
