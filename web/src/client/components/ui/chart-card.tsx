"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Badge } from "@/client/components/ui/badge";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { equityData } from "@/client/lib/mock-data";

export function ChartCard({ title, backtest = false }: { title: string; backtest?: boolean }) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline">{backtest ? '2019 – 2026' : '12 months'}</Badge>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="fillPortfolio" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#62d7c6" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#62d7c6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 10 }} />
              <Area type="monotone" dataKey="portfolio" stroke="#62d7c6" fill="url(#fillPortfolio)" strokeWidth={2} />
              <Area type="monotone" dataKey="benchmark" stroke="#8fa7ff" fill="none" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <span><i className="mr-1.5 inline-block size-2 rounded-full bg-primary" />Portfolio</span>
          <span><i className="mr-1.5 inline-block size-2 rounded-full bg-[#8fa7ff]" />Benchmark</span>
        </div>
      </CardContent>
    </Card>
  );
}
