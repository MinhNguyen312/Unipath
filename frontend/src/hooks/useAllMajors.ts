// src/hooks/useAllMajors.ts
import { useQuery } from "@tanstack/react-query"

export function useAllMajors() {
  return useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8080/api/majors")
      if (!res.ok) throw new Error("Failed to fetch majors")
      const data = await res.json()
      return data
        .map((item: { ten_nganh: string | null }) => item.ten_nganh)
        .filter((name: string | null): name is string => typeof name === "string")
    },
    staleTime: 1000 * 60 * 10, // cache 10 phút
  })
}
