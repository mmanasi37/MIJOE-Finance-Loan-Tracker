import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 bg-muted" />
        <Skeleton className="h-4 w-40 bg-muted" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border shadow-none">
            <CardContent className="pt-5 pb-4 space-y-2">
              <Skeleton className="h-3 w-20 bg-muted" />
              <Skeleton className="h-7 w-24 bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border shadow-none">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-40 bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2.5 w-full rounded-full bg-muted" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20 bg-muted" />
            <Skeleton className="h-3 w-20 bg-muted" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border shadow-none">
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-muted" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}
