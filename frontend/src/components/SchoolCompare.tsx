"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Input } from "./ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Card, CardContent } from "./ui/card"
import { AutoSuggestInput } from "./AutoSuggestInput"
import { useUniversitiesByMajor } from "@/hooks/useUniversitiesByMajor"
import { SchoolSelector } from "./SchoolSelector"

export default function SchoolComparison() {
  const [schools, setSchools] = React.useState<string[]>(["", "", ""])
  const [selectedMajor, setSelectedMajor] = React.useState("")

  const { data: universityOptions = [], isLoading } =
    useUniversitiesByMajor(selectedMajor)

  const handleSchoolChange = (value: string, index: number) => {
    const newSchools = [...schools]
    newSchools[index] = value
    setSchools(newSchools)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-green-800 mb-2">
          So sánh điểm của ngành
        </h2>

        <AutoSuggestInput
          placeholder="Nhập tên ngành..."
          onSelect={(value) => {
            setSelectedMajor(value)
            setSchools(["", "", ""])
          }}
        />

        {selectedMajor && (
          <div className="mt-4 text-sm text-muted-foreground">
            Ngành đã chọn: <strong>{selectedMajor}</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <label className="text-lg font-bold text-green-800">Trường</label>
            <SchoolSelector
              value={schools[index]}
              onChange={(val) => handleSchoolChange(val, index)}
              options={universityOptions}
              disabled={isLoading || !selectedMajor}
              selectedValues={schools}
            />
          </div>
        ))}
      </div>

      <Card className="border-green-200 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-green-200">
                <TableHead className="w-1/4 font-bold text-green-800 border-r border-green-200">
                  Thông tin
                </TableHead>
                {schools.map((school, i) => (
                  <TableHead
                    key={i}
                    className="w-1/4 font-bold text-green-800 text-center border-r border-green-200 last:border-r-0"
                  >
                    {school || `Trường ${i + 1}`}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {["Địa điểm", "Chart điểm chuẩn", "Học phí", "Khối xét tuyển"].map(
                (label, idx) => (
                  <TableRow key={idx} className="border-b border-green-200">
                    <TableCell className="font-bold text-green-800 border-r border-green-200">
                      {label}
                    </TableCell>
                    {schools.map((_, i) => (
                      <TableCell
                        key={i}
                        className="border-r border-green-200 last:border-r-0"
                      >
                        -
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
