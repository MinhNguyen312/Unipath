"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

type Props = {
  value: string
  onChange: (val: string) => void
  options: string[]
  disabled?: boolean
  selectedValues: string[] // ✨ NEW: truyền thêm toàn bộ các trường đã chọn
}

export function SchoolSelector({ value, onChange, options, disabled, selectedValues }: Props) {
  const [open, setOpen] = React.useState(false)

  // ✨ Lọc danh sách options: bỏ những trường đã chọn (ngoại trừ trường đang chọn ở ô này)
  const filteredOptions = options.filter(
    (option) => !selectedValues.includes(option) || option === value
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 bg-green-100 border border-green-300 rounded text-left truncate",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          title={value || "Chọn trường..."}
        >
          {value || "Chọn trường..."}
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-full max-h-64 overflow-y-auto">
        <Command>
          <CommandInput placeholder="Tìm trường..." />
          <CommandEmpty>Không có trường phù hợp.</CommandEmpty>
          <CommandGroup>
            {filteredOptions.map((option, i) => (
              <CommandItem
                key={i}
                value={option}
                onSelect={() => {
                  onChange(option)
                  setOpen(false)
                }}
                className="truncate hover:bg-green-50 transition-all" // ✨ Hover nhẹ nhàng + đẹp
                title={option}
              >
                <Check
                  className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
