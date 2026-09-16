"use client";

import { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { Input } from '@/client/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { marketData } from '@/client/lib/mock-data';
import { PageIntro } from '@/client/components/ui/dashboard-widgets';

export default function MarketDataPage() {
  const [query, setQuery] = useState('');
  const [refreshed, setRefreshed] = useState(false);
  
  const filtered = marketData.filter((item) =>
    `${item.ticker} ${item.name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageIntro
        eyebrow="Live market context"
        title="Market Data"
        description="Track the benchmarks and macro assets that shape your portfolio."
        action={
          <Button
            variant="outline"
            onClick={() => {
              setRefreshed(true);
              setTimeout(() => setRefreshed(false), 1200);
            }}
          >
            <RefreshCw data-icon="inline-start" className={refreshed ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
            {refreshed ? 'Refreshing…' : 'Refresh data'}
          </Button>
        }
      />
      <Card className="border-border/70 bg-card/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symbols"
              className="h-9 pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Instrument</TableHead>
                <TableHead>Last price</TableHead>
                <TableHead>Day change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.ticker}>
                  <TableCell className="font-medium">{item.ticker}</TableCell>
                  <TableCell className="text-muted-foreground">{item.name}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell className={item.positive ? 'text-primary' : 'text-destructive'}>
                    {item.change}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="mt-4 border-border/70 bg-card/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Market breadth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Advancing', value: 68 }, { name: 'Declining', value: 32 }]}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="value" fill="#62d7c6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
