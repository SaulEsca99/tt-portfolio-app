"use client";

import { useState } from 'react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { PageIntro, StatCard } from '@/client/components/ui/dashboard-widgets';
import { ChartCard } from '@/client/components/ui/chart-card';

export default function OptimizationPage() {
  const [running, setRunning] = useState(false);

  return (
    <div>
      <PageIntro
        eyebrow="Quantitative tools"
        title="Optimization"
        description="Find an allocation that balances expected return and portfolio risk."
        action={
          <Button
            onClick={() => {
              setRunning(true);
              setTimeout(() => setRunning(false), 1600);
            }}
            disabled={running}
          >
            {running ? 'Optimizing…' : 'Run optimization'}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Expected return" value="13.8%" detail="+1.4%" />
        <StatCard label="Expected volatility" value="13.2%" detail="-1.6%" positive={false} />
        <StatCard label="Sharpe ratio" value="0.94" detail="+0.18" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Model settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {['Objective', 'Constraints', 'Rebalance frequency'].map((label) => (
              <label key={label} className="text-sm">
                {label}
                <select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>
                    {label === 'Objective'
                      ? 'Maximize Sharpe ratio'
                      : label === 'Constraints'
                        ? 'Long only · 5% minimum'
                        : 'Monthly'}
                  </option>
                  <option>Alternative scenario</option>
                </select>
              </label>
            ))}
          </CardContent>
        </Card>
        <ChartCard title="Efficient frontier" />
      </div>
    </div>
  );
}
