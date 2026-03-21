"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { formatDate, formatYen } from "@/lib/utils";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  amount: number | null;
  note: string | null;
}

interface JournalCardProps {
  entry: JournalEntry;
  onDelete: (id: string) => void;
}

export function JournalCard({ entry, onDelete }: JournalCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(entry.date + "T00:00:00"))}
            </p>
            {entry.amount != null && (
              <Badge variant="secondary" className="text-xs">
                {formatYen(entry.amount)}
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium">{entry.content}</p>
          {entry.note && (
            <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(entry.id)}
          className="shrink-0"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  );
}
