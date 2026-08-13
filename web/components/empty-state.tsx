import { type LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="w-12 h-12 text-muted-foreground/30 mb-4" />
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}
