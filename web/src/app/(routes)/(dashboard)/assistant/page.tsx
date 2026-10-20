"use client";

import { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Card, CardContent } from '@/client/components/ui/card';
import { Textarea } from '@/client/components/ui/textarea';
import { PageIntro } from '@/client/components/ui/dashboard-widgets';
import { useT } from '@/client/lib/i18n/i18n-context';

export default function AssistantPage() {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const { t } = useT();
  const a = t.assistant;

  return (
    <div className="mx-auto max-w-3xl">
      <PageIntro
        eyebrow={a.eyebrow}
        title={a.title}
        description={a.description}
      />
      <Card className="border-border/70 bg-card/70 shadow-none">
        <CardContent className="p-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={a.placeholder}
            className="min-h-32 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">{a.disclaimer}</span>
            <Button onClick={() => setSent(true)} disabled={!message.trim()}>
              <Bot data-icon="inline-start" className="mr-2 h-4 w-4" />
              {a.askBtn}
            </Button>
          </div>
        </CardContent>
      </Card>

      {sent && (
        <Card className="mt-5 border-primary/20 bg-primary/5 shadow-none">
          <CardContent className="p-5 text-sm leading-relaxed">
            <p className="mb-2 font-medium">{a.aiName}</p>
            <p className="text-muted-foreground">{a.aiResponse}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {a.suggestions.map((prompt) => (
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
