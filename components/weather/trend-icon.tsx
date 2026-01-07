import { Equal, MoveDownRight, MoveUpRight } from "lucide-react"

interface TrendIconProps {
  diferencial: number
  threshold?: number
}

export default function TrendIcon({ diferencial, threshold = 0.2 }: TrendIconProps) {
  if (diferencial > threshold) {
    return <MoveUpRight />
  }
  if (diferencial < -threshold) {
    return <MoveDownRight />
  }
  return <Equal />
}