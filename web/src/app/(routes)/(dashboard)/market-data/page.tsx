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
import { useT } from '@/client/lib/i18n/i18n-context';

export default function MarketDataPage() {
  const [query, setQuery] = useState('');
  const [refreshed, setRefreshed] = useState(false);
  const { t } = useT();
  const m = t.marketData;

  const filtered = marketData.filter((item) =>
    `${item.ticker} ${item.name}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageIntro
        eyebrow={m.eyebrow}
        title={m.title}
        description={m.description}
        action={
          <Button
            variant="outline"
            onClick={() => {
              setRefreshed(true);
              setTimeout(() => setRefreshed(false), 1200);
            }}
          >
            <RefreshCw data-icon="inline-start" className={refreshed ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
            {refreshed ? '…' : '↺'}
          </Button>
        }
      />
      <Card className="border-border/70 bg-card/70 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">{m.watchlist}</CardTitle>
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={m.searchInstruments}
              className="h-9 pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{m.symbolCol}</TableHead>
                <TableHead>{m.instrument}</TableHead>
                <TableHead>{m.lastPrice}</TableHead>
                <TableHead>{m.dayChange}</TableHead>
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
          <CardTitle className="text-sm font-medium">{m.marketBreadth}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: m.advancing, value: 68 }, { name: m.declining, value: 32 }]}>
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
