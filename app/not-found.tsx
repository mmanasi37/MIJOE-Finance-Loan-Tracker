import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="font-heading text-6xl font-bold text-muted/40">404</p>
        <h1 className="font-heading text-xl font-semibold text-foreground">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link href="/login">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer glow-gold mt-2">
            Go to login
          </Button>
        </Link>
      </div>
    </div>
  )
}
