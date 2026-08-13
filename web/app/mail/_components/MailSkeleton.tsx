import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MailSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} size="sm">
          <CardHeader>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-3/4 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full mt-1.5" />
            <Skeleton className="h-3 w-5/6 mt-1.5" />
            <Skeleton className="h-3 w-4/6 mt-1.5" />
            <Skeleton className="h-3 w-3/6 mt-1.5" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-7 w-14 ml-1" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
