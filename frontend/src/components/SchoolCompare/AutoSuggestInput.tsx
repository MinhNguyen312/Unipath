"use client"
import { useState } from "react"
import { AutoComplete, Input, Spin } from "antd"
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons"
import { useAllMajors } from "../../hooks/useAllMajors"

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
  const [inputValue, setInputValue] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState<{ value: string; label: string }[]>([])
  const [open, setOpen] = useState(false)

  const { data: allMajors = [], isLoading } = useAllMajors()

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value)
    onChange?.(value)

    if (!value.trim()) {
      setFilteredSuggestions([])
      setOpen(false)
      return
    }

    const filtered = allMajors
      .filter((item: string) => item.toLowerCase().includes(value.toLowerCase()))
      .map((item: string) => ({ value: item, label: item }))

    setFilteredSuggestions(filtered.slice(0, 10))
    setOpen(true)
  }

  // Handle select
  const handleSelect = (value: string) => {
    setInputValue(value)
    setOpen(false)
    onSelect?.(value)
  }

  return (
    <div className="w-full">
      <AutoComplete
        value={inputValue}
        options={filteredSuggestions}
        onChange={handleInputChange}
        onSelect={handleSelect}
        open={open && filteredSuggestions.length > 0}
        style={{ width: "100%" }}
        notFoundContent={
          isLoading ? <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} /> : "Không tìm thấy ngành."
        }
      >
        <Input
          placeholder={placeholder}
          className={className}
          prefix={<SearchOutlined />}
          onFocus={() => {
            if (inputValue.trim()) setOpen(true)
          }}
        />
      </AutoComplete>
    </div>
  )
}
