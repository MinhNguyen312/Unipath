"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAllMajors } from "@/hooks/useAllMajors"

interface AutoSuggestInputProps {
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
  onSelect?: (value: string) => void
}

export function AutoSuggestInput({
  placeholder = "Tìm ngành...",
  className,
  onChange,
  onSelect,
}: AutoSuggestInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const commandRef = useRef<HTMLDivElement>(null)

  const [inputValue, setInputValue] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: allMajors = [], isLoading } = useAllMajors()

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    onChange?.(value)

    if (!value.trim()) {
      setFilteredSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filtered = allMajors.filter((item: string) =>
      item.toLowerCase().includes(value.toLowerCase())
    )
    setFilteredSuggestions(filtered.slice(0, 10))
    setShowSuggestions(true)
  }

  // Handle select
  const handleSelect = (value: string) => {
    setInputValue(value)
    setShowSuggestions(false)
    onSelect?.(value)
    inputRef.current?.focus()
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue.trim()) setShowSuggestions(true)
        }}
        className={cn(
          "w-full focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:outline-none",
          className
        )}
      />

      {showSuggestions && (
        <div
          ref={commandRef}
          className="absolute top-full left-0 w-full mt-1 z-50 bg-background border rounded-md shadow-md overflow-hidden"
        >
          <Command className="rounded-lg border shadow-md">
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>Không tìm thấy ngành.</CommandEmpty>
                  <CommandGroup>
                    {filteredSuggestions.map((suggestion, index) => (
                      <CommandItem
                        key={index}
                        onSelect={() => handleSelect(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
