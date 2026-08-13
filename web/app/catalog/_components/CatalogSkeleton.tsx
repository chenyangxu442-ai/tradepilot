import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CatalogSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full mt-2" />
          ))}
        </div>
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-2/3 mt-2" />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-1/2" />
      </CardFooter>
    </Card>
  );
}
