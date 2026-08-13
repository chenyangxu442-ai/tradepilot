'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText, ChevronDown, Trash2 } from 'lucide-react';
import { EXPO_SCENARIOS } from '@/lib/constants';

// ponytail: inline HistoryItem — same shape as other modules, extracting is YAGNI
interface HistoryItem {
  id: string;
  module: string;
  inputs: Record<string, string>;
  results: unknown;
  timestamp: string;
}

export function ExpoHistory({ items, onSelect, onClear }: { items: HistoryItem[]; onSelect: (item: HistoryItem) => void; onClear: () => void }) {
  const expoItems = items.filter((i) => i.module === 'expo');
  if (expoItems.length === 0) return null;

  return (
    <Collapsible className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm font-medium hover:bg-accent group">
        <span className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-muted-foreground" />
          历史记录 ({expoItems.length})
        </span>
        <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-2 flex flex-col gap-1 max-h-64 overflow-auto">
          {expoItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="text-left p-2 rounded-md hover:bg-accent transition-colors text-xs w-full"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                  {EXPO_SCENARIOS.find((s) => s.value === item.inputs.scenario)?.label ?? item.inputs.scenario}
                </Badge>
                <span className="text-muted-foreground ml-auto">
                  {new Date(item.timestamp).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-muted-foreground truncate">{item.inputs.product_info?.slice(0, 50)}</p>
            </button>
          ))}
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mt-1" onClick={() => { if (confirm('确定要清空历史记录吗？此操作不可撤销。')) onClear(); }}>
            <Trash2 className="h-3 w-3 mr-1" />清空记录
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
