import { useQuery } from "@tanstack/react-query"

export function useUniversitiesByMajor(major: string | null) {
  return useQuery({
    queryKey: ["universities", major],
    queryFn: async () => {
      if (!major) return []

      const res = await fetch(
        `http://localhost:8080/api/universities?major=${encodeURIComponent(major)}`
      )

      if (!res.ok) {
        throw new Error("Failed to fetch universities")
      }

      const data = await res.json()

      // data ví dụ: [ { truong: "ĐH Bách Khoa" }, ... ]
      return (data as { ten_truong: string | null }[])
        .map((item) => item.ten_truong)
        .filter((name): name is string => !!name)
    },
    enabled: !!major, 
    staleTime: 5 * 60 * 1000,
  })
}
