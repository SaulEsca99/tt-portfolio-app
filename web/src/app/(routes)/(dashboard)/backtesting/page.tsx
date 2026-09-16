"use client";

import { useState } from 'react';
import { Button } from '@/client/components/ui/button';
import { PageIntro, StatCard } from '@/client/components/ui/dashboard-widgets';
import { ChartCard } from '@/client/components/ui/chart-card';

export default function BacktestingPage() {
  const [running, setRunning] = useState(false);

  return (
    <div>
      <PageIntro
        eyebrow="Historical analysis"
        title="Backtesting"
        description="Evaluate how your strategy would have behaved across different market cycles."
        action={
          <Button
            onClick={() => {
              setRunning(true);
              setTimeout(() => setRunning(false), 1800);
            }}
            disabled={running}
          >
            {running ? 'Running backtest…' : 'Run backtest'}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cumulative return" value="+214.8%" detail="vs 176.2%" />
        <StatCard label="Annualized return" value="15.7%" detail="+2.4%" />
        <StatCard label="Max drawdown" value="-23.4%" detail="-4.1%" positive={false} />
        <StatCard label="Win rate" value="68.2%" detail="+6.8%" />
      </div>
      <div className="mt-4">
        <ChartCard title="Equity curve" backtest />
      </div>
    </div>
  );
}
