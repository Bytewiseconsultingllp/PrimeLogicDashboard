"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Visitor = Record<string, unknown>

function prettyLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function VisitorCard({ visitor, index }: { visitor: Visitor; index: number }) {
  const entries = Object.entries(visitor ?? {})

  return (
    <Card className="bg-card text-card-foreground">
      <CardHeader>
        <CardTitle className="text-balance">{`Visitor ${index + 1}`}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground">No details available for this visitor.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {entries.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">{prettyLabel(key)}</dt>
                <dd className="rounded-md border border-border bg-background p-3 text-sm leading-relaxed">
                  {typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  )
}
