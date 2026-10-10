export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return '';
  }
}

export function getScoreColors(score: number): {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-copper-light',
      text: 'text-copper-dark',
      border: 'border-copper-border',
      badgeBg: 'bg-copper'
    };
  }
  if (score >= 65) {
    return {
      bg: 'bg-olive-light',
      text: 'text-olive-dark',
      border: 'border-olive-border',
      badgeBg: 'bg-olive'
    };
  }
  return {
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-300',
    badgeBg: 'bg-stone-600'
  };
}

export function formatOpportunityType(type: string): string {
  const map: Record<string, string> = {
    new_product: 'New Standalone Product',
    better_alternative: 'Better Alternative',
    underserved_segment: 'Underserved Segment',
    missing_feature: 'Missing Integration / Feature',
    workflow_automation: 'Workflow Automation',
    niche_adaptation: 'Niche Adaptation'
  };
  return map[type] || type.replace('_', ' ');
}
