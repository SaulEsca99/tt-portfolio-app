"use client";

import { useState } from 'react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { PageIntro, StatCard } from '@/client/components/ui/dashboard-widgets';
import { ChartCard } from '@/client/components/ui/chart-card';
import { useT } from '@/client/lib/i18n/i18n-context';

export default function OptimizationPage() {
  const [running, setRunning] = useState(false);
  const { t } = useT();
  const o = t.optimize;

  return (
    <div>
      <PageIntro
        eyebrow={o.eyebrow}
        title={o.title}
        description={o.description}
        action={
          <Button
            onClick={() => {
              setRunning(true);
              setTimeout(() => setRunning(false), 1600);
            }}
            disabled={running}
          >
            {running ? o.runningBtn : o.runBtn}
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <StatCard label={o.expectedReturn} value="13.8%" detail="+1.4%" />
        <StatCard label={o.expectedVolatility} value="13.2%" detail="-1.6%" positive={false} />
        <StatCard label={o.sharpe} value="0.94" detail="+0.18" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{o.modelSettings}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[
              { label: o.objective, defaultVal: o.objectiveDefault },
              { label: o.constraints, defaultVal: o.constraintsDefault },
              { label: o.rebalance, defaultVal: o.rebalanceDefault },
            ].map(({ label, defaultVal }) => (
              <label key={label} className="text-sm">
                {label}
                <select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>{defaultVal}</option>
                  <option>{o.alternative}</option>
                </select>
              </label>
            ))}
          </CardContent>
        </Card>
        <ChartCard title={o.efficientFrontier} />
      </div>
    </div>
  );
}
