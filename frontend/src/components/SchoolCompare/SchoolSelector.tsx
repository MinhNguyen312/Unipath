"use client"
import { Select } from "antd"
import { CheckOutlined } from "@ant-design/icons"

type Props = {
  value: string
  onChange: (val: string) => void
  options: string[]
  disabled?: boolean
  selectedValues: string[]
}

export function SchoolSelector({ value, onChange, options, disabled, selectedValues }: Props) {
  // Filter options: remove already selected schools (except the current one)
  const filteredOptions = options
    .filter((option) => !selectedValues.includes(option) || option === value)
    .map((option) => ({
      value: option,
      label: (
        <div style={{ display: "flex", alignItems: "center" }}>
          {value === option && <CheckOutlined style={{ marginRight: 8 }} />}
          <span>{option}</span>
        </div>
      ),
    }))

  return (
    <Select
      value={value || undefined}
      onChange={onChange}
      disabled={disabled}
      placeholder="Chọn trường..."
      style={{ width: "100%" }}
      options={filteredOptions}
      showSearch
      filterOption={(input, option) => (option?.value as string).toLowerCase().includes(input.toLowerCase())}
      notFoundContent="Không có trường phù hợp."
      className="school-selector"
    />
  )
}
