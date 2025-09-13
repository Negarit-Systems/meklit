import { BarChart3 } from "lucide-react"

export function Header() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 justify-center">
        <BarChart3 className="h-6 w-6 text-green-500" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text">
          Data Comparison Dashboard
        </h1>
      </div>
      <p className="text-muted-foreground text-center">
        Compare performance metrics across children, classes, and centers to gain valuable insights.
      </p>
    </div>
  )
}
