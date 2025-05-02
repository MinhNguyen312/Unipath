import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useScoreChart(major: string, university: string) {
  return useQuery({
    queryKey: ["score-chart", major, university],
    queryFn: async () => {
      const { data } = await axios.get("/api/score-chart", {
        params: { major, university },
      });
      return data; 
    },
    enabled: !!major && !!university,
  });
}
