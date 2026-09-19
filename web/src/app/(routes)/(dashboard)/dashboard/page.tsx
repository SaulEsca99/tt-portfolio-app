"use client";

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { Input } from '@/client/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { holdings, allocationData } from '@/client/lib/mock-data';
import { StatCard } from '@/client/components/ui/dashboard-widgets';
import { ChartCard } from '@/client/components/ui/chart-card';
import Link from 'next/link';

export default function DashboardPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => holdings.filter((item) => `${item.symbol} ${item.name}`.toLowerCase().includes(query.toLowerCase())), [query]);

  const { greeting, formattedDate } = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    let greet = 'Good evening';
    if (hour >= 5 && hour < 12) greet = 'Good morning';
    else if (hour >= 12 && hour < 18) greet = 'Good afternoon';
    const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return { greeting: greet, formattedDate: date };
  }, []);

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">{formattedDate}</p>
          <h2 className="text-3xl font-semibold tracking-tight">{greeting}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s how your portfolio is performing today.</p>
        </div>
        <Button asChild>
          <Link href="/portfolios/new">
            <Plus data-icon="inline-start" className="mr-2 h-4 w-4" />
            Create Portfolio
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Portfolio value" value="$100,000" detail="+6.8%" />
        <StatCard label="Today&apos;s return" value="+$1,284" detail="+1.31%" />
        <StatCard label="Annualized return" value="12.42%" detail="vs 9.8% benchmark" />
        <StatCard label="Volatility" value="14.8%" detail="-2.1%" positive={false} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Portfolio performance" />
        <Card className="border-border/70 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocationData} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={3}>
                    {allocationData.map((item) => <Cell key={item.name} fill={item.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-2xl font-semibold">100%</p>
                  <p className="text-xs text-muted-foreground">allocated</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span>
                    <i className="mr-1.5 inline-block size-2 rounded-full" style={{ background: item.fill }} />
                    {item.name}
                  </span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-border/70 bg-card/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search holdings" className="h-9 pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Holding</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.symbol}>
                  <TableCell className="font-medium">{item.symbol}</TableCell>
                  <TableCell className="text-muted-foreground">{item.name}</TableCell>
                  <TableCell>{item.weight}%</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell className={item.positive ? 'text-primary' : 'text-destructive'}>{item.change}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
