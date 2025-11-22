import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
