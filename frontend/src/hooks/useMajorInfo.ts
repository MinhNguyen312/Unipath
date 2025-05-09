import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useMajorInfo(major: string, university: string) {
    return useQuery({
      queryKey: ["major-info", major, university],
      queryFn: async () => {
        const { data } = await axios.get(`/api/major-info`, {
          params: { major, university },
        });
        return data;
      },
      enabled: !!major && !!university,
    });
  }
  
