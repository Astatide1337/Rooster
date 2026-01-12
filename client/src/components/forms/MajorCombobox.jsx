import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { MAJORS, searchMajors } from "@/data/majors"

/**
 * A searchable dropdown for selecting a Major.
 * Supports alias-based fuzzy search.
 */
export function MajorCombobox({ value, onValueChange, placeholder = "Select major...", className }) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")

    const filteredMajors = React.useMemo(() => searchMajors(search), [search])

    const selectedMajor = MAJORS.find(m => m.value === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal", className)}
                >
                    {selectedMajor ? selectedMajor.value : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search majors (e.g., 'cs', 'ece')..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>No major found.</CommandEmpty>
                        <CommandGroup>
                            {filteredMajors.map((major) => (
                                <CommandItem
                                    key={major.value}
                                    value={major.value}
                                    onSelect={() => {
                                        onValueChange(major.value === value ? "" : major.value)
                                        setOpen(false)
                                        setSearch("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === major.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span>{major.value}</span>
                                    {major.aliases.length > 0 && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            ({major.aliases.slice(0, 2).join(", ")}{major.aliases.length > 2 ? "..." : ""})
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
