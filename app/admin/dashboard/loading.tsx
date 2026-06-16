import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-muted" />
          <Skeleton className="h-4 w-24 bg-muted" />
        </div>
        <Skeleton className="h-9 w-36 bg-muted" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border shadow-none">
            <CardContent className="pt-5 pb-4 space-y-2">
              <Skeleton className="h-3 w-20 bg-muted" />
              <Skeleton className="h-8 w-12 bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-card border-border shadow-none">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 bg-muted" />
                  <Skeleton className="h-3 w-40 bg-muted" />
                </div>
                <Skeleton className="h-4 w-20 bg-muted" />
                <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                <Skeleton className="h-4 w-16 bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
