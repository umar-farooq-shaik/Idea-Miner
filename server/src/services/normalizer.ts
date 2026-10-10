import { SourceType } from '../types/index.js';

export function canonicalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Remove tracking query parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'ref', 'ref_src', 'source', 'igshid', '_ga', 'mc_cid'
    ];
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }
    // Remove hash
    parsed.hash = '';
    
    let canonical = parsed.toString();
    // Remove trailing slash if path is longer than /
    if (canonical.endsWith('/') && parsed.pathname !== '/') {
      canonical = canonical.slice(0, -1);
    }
    return canonical;
  } catch {
    return rawUrl.trim();
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

export function detectSourceType(url: string, title: string = ''): SourceType {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();

  if (lowerUrl.includes('reddit.com')) {
    return 'reddit';
  }
  if (
    lowerUrl.includes('g2.com') ||
    lowerUrl.includes('capterra.com') ||
    lowerUrl.includes('trustpilot.com') ||
    lowerUrl.includes('producthunt.com') ||
    lowerUrl.includes('trustradius.com') ||
    lowerTitle.includes('review')
  ) {
    return 'review';
  }
  if (
    lowerUrl.includes('news.ycombinator.com') ||
    lowerUrl.includes('stackoverflow.com') ||
    lowerUrl.includes('stackexchange.com') ||
    lowerUrl.includes('quora.com') ||
    lowerTitle.includes('q&a')
  ) {
    return 'qna';
  }
  if (
    lowerUrl.includes('forum') ||
    lowerUrl.includes('community') ||
    lowerUrl.includes('discourse') ||
    lowerUrl.includes('discuss')
  ) {
    return 'forum';
  }
  return 'web';
}

export function cleanSnippet(snippet: string): string {
  if (!snippet) return '';
  // Remove HTML tags
  let cleaned = snippet.replace(/<[^>]*>/g, ' ');
  // Unescape standard HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  // Collapse whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}
