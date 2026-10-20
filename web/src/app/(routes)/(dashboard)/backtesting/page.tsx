"use client";

import { useState } from 'react';
import { Button } from '@/client/components/ui/button';
import { PageIntro, StatCard } from '@/client/components/ui/dashboard-widgets';
import { ChartCard } from '@/client/components/ui/chart-card';
import { useT } from '@/client/lib/i18n/i18n-context';

export default function BacktestingPage() {
  const [running, setRunning] = useState(false);
  const { t } = useT();
  const b = t.backtesting;

  return (
    <div>
      <PageIntro
        eyebrow={b.eyebrow}
        title={b.title}
        description={b.description}
        action={
          <Button
            onClick={() => {
              setRunning(true);
              setTimeout(() => setRunning(false), 1800);
            }}
            disabled={running}
          >
            {running ? b.runningBtn : b.runBtn}
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={b.cumulativeReturn} value="+214.8%" detail="vs 176.2%" />
        <StatCard label={b.annualizedReturn} value="15.7%" detail="+2.4%" />
        <StatCard label={b.maxDrawdown} value="-23.4%" detail="-4.1%" positive={false} />
        <StatCard label={b.winRate} value="68.2%" detail="+6.8%" />
      </div>
      <div className="mt-4">
        <ChartCard title={b.equityCurve} backtest />
      </div>
    </div>
  );
}
