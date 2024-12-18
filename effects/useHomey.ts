import { Homey } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

export function useHomey(homeyId: string): {
  homey: Omit<Homey, "sessionToken" | "eventKey">
  isLoading: boolean
} {
  const homey = useQuery({
    queryKey: ["homey", homeyId],
    queryFn: () => fetch(`/api/homey/${homeyId}`).then((res) => res.json()),
  })

  return { homey: homey.data?.homey, isLoading: homey.isLoading }
}
