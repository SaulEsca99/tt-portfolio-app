"use client";

import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent } from '@/client/components/ui/card';
import { Textarea } from '@/client/components/ui/textarea';
import { PageIntro } from '@/client/components/ui/dashboard-widgets';

export default function AssistantPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <PageIntro
        eyebrow="Portfolio intelligence"
        title="What would you like to explore?"
        description="Ask about your portfolio, market trends, or investment strategy."
      />
      <Card className="border-border/70 bg-card/70 shadow-none">
        <CardContent className="p-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. How can I reduce my portfolio volatility?"
            className="min-h-32 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              Aperture AI can make mistakes. Review important decisions.
            </span>
            <Button onClick={() => setSent(true)} disabled={!message.trim()}>
              <Bot data-icon="inline-start" className="mr-2 h-4 w-4" />
              Ask Aperture
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {sent && (
        <Card className="mt-5 border-primary/20 bg-primary/5 shadow-none">
          <CardContent className="p-5 text-sm leading-relaxed">
            <p className="mb-2 font-medium">Aperture AI</p>
            <p className="text-muted-foreground">
              Based on your current 62% risk tolerance, your portfolio has a balanced growth profile.
              Consider increasing VXUS toward its 25% target and reviewing BND duration exposure.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {['Explain my risk score', 'Find diversification gaps', 'Compare against 60/40'].map((prompt) => (
          <button
            key={prompt}
            onClick={() => setMessage(prompt)}
            className="rounded-xl border border-border/70 bg-card/40 p-4 text-left text-xs font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <Sparkles className="mb-3 size-4 text-primary" />
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
