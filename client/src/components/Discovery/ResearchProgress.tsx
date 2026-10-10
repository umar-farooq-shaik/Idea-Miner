import React, { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { Loader2, Search, Filter, Sparkles, CheckCircle } from 'lucide-react';

interface ResearchProgressProps {
  topic: string;
  depth: 'quick' | 'deep';
  isDemo?: boolean;
}

export const ResearchProgress: React.FC<ResearchProgressProps> = ({ topic, depth, isDemo }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Formulating Targeted Search Queries', desc: 'Crafting complaint-focused queries for Reddit, forums, and verified review sites', icon: Search },
    { title: 'Mining Live Evidence & Complaints', desc: isDemo ? 'Synthesizing grounded illustrative complaint dataset' : 'Retrieving public discussions, competitor drawbacks & workarounds via SerpApi', icon: Filter },
    { title: 'Deduplicating & Canonicalizing Evidence', desc: 'Stripping tracking parameters, normalizing URLs, and clustering recurring patterns', icon: CheckCircle },
    { title: 'Structured Synthesis with Gemini AI', desc: 'Extracting user consequences, estimating severity, identifying market gaps & computing transparent scores', icon: Sparkles }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1200);
    const timer2 = setTimeout(() => setCurrentStep(2), 2600);
    const timer3 = setTimeout(() => setCurrentStep(3), 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <Card className="border border-copper-border/60 bg-gradient-to-b from-stone-50 to-white shadow-editorial p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-lg bg-copper-light text-copper shrink-0">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-bold text-charcoal">
            Conducting {depth === 'deep' ? 'Deep Research' : 'Quick Scan'} on "{topic}"
          </h3>
          <p className="text-xs text-charcoal-muted">
            {isDemo ? 'Exploring via deterministic sample data engine' : 'Searching live web sources and analyzing with Google Gemini'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const Icon = step.icon;

          return (
            <div key={idx} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-all ${
                isDone ? 'bg-olive text-white' :
                isCurrent ? 'bg-copper text-white ring-4 ring-copper/20 animate-pulse' :
                'bg-stone-200 text-stone-500'
              }`}>
                {isDone ? '✓' : idx + 1}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${
                  isCurrent ? 'text-copper-dark' : isDone ? 'text-charcoal' : 'text-stone-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-charcoal-muted mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
