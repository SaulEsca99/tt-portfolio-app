"use client";

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card';
import { Separator } from '@/client/components/ui/separator';
import { Slider } from '@/client/components/ui/slider';
import { Badge } from '@/client/components/ui/badge';
import { PageIntro } from '@/client/components/ui/dashboard-widgets';
import { useT } from '@/client/lib/i18n/i18n-context';

export default function PortfolioBuilderPage() {
  const [risk, setRisk] = useState([62]);
  const [saved, setSaved] = useState(false);
  const { t } = useT();
  const p = t.portfolioBuilder;

  const assets = ['VTI · US Equities', 'VXUS · International', 'BND · Bonds', 'VNQ · Real Estate'];

  return (
    <div>
      <PageIntro
        eyebrow={p.eyebrow}
        title={p.title}
        description={p.description}
        action={
          <Button onClick={() => setSaved(true)}>
            <Check data-icon="inline-start" className="mr-2 h-4 w-4" />
            {saved ? p.savedBtn : p.saveBtn}
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{p.targetAllocation}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {assets.map((asset, index) => (
              <div key={asset} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{asset}</p>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${[42, 22, 20, 10][index]}%` }} />
                  </div>
                </div>
                <span className="w-10 text-right text-sm font-medium">{[42, 22, 20, 10][index]}%</span>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{p.cashBuffer}</span>
              <span className="font-medium">6%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{p.riskProfile}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold">{risk[0]}</p>
                <p className="text-xs text-muted-foreground">{p.outOf}</p>
              </div>
              <Badge variant="secondary">{p.balancedGrowth}</Badge>
            </div>
            <Slider
              value={risk}
              onValueChange={(value) => setRisk(Array.isArray(value) ? [...value] : [value])}
              max={100}
              step={1}
              className="mt-8"
            />
            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>{p.conservative}</span>
              <span>{p.aggressive}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
