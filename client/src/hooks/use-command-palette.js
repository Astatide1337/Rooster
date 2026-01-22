import { useState, useEffect } from 'react'

/**
 * Hook to handle ⌘K / Ctrl+K keyboard shortcut
 */
export function useCommandPalette() {
    const [open, setOpen] = useState(false)

    useEffect(() => {
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
