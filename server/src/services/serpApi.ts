import { ResearchDepth, SearchResultRecord } from '../types/index.js';
import { canonicalizeUrl, extractDomain, detectSourceType, cleanSnippet } from './normalizer.js';
import { v4 as uuidv4 } from 'uuid';

export interface SerpApiSearchParams {
  topic: string;
  targetCustomer?: string;
  geographicMarket?: string;
  includeKeywords?: string;
  excludeKeywords?: string;
  depth: ResearchDepth;
  apiKey: string;
  researchId: string;
}

export interface SerpApiSearchOutcome {
  results: SearchResultRecord[];
  queriesExecuted: string[];
  totalRetrieved: number;
  deduplicatedCount: number;
}

/**
 * Executes targeted web searches via SerpApi to unearth authentic complaints,
 * workarounds, and unmet needs across Reddit, forums, reviews, and Q&A boards.
 */
export async function executeSerpApiSearch(params: SerpApiSearchParams): Promise<SerpApiSearchOutcome> {
  const { topic, targetCustomer, includeKeywords, excludeKeywords, depth, apiKey, researchId } = params;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('SERPAPI_API_KEY is not configured. Please supply a valid SerpApi API key.');
  }

  // Construct search queries specifically tailored for pain-point mining
  const queries: string[] = [];
  const customerPart = targetCustomer ? ` "${targetCustomer}"` : '';
  const includePart = includeKeywords ? ` ${includeKeywords.split(',').map(k => `"${k.trim()}"`).join(' ')}` : '';
  const excludePart = excludeKeywords ? ` ${excludeKeywords.split(',').map(k => `-${k.trim()}`).join(' ')}` : '';

  // 1. Reddit deep dive: where users express unfiltered frustrations
  queries.push(`site:reddit.com "${topic}"${customerPart} ("hate" OR "frustrated" OR "annoying" OR "wish there was" OR "why is it so hard" OR "complaint")${includePart}${excludePart}`);

  // 2. Forum & Review complaints / alternatives
  queries.push(`"${topic}"${customerPart} ("alternative to" OR "switched from" OR "doesn't work" OR "missing feature" OR "overpriced" OR "terrible")${includePart}${excludePart}`);

  if (depth === 'deep') {
    // 3. Review platforms & Q&A
    queries.push(`(site:g2.com OR site:capterra.com OR site:trustpilot.com OR site:news.ycombinator.com) "${topic}"${customerPart} ("cons" OR "drawback" OR "frustration" OR "switched")${includePart}${excludePart}`);
    // 4. Specific workarounds & unmet needs
    queries.push(`"${topic}"${customerPart} ("workaround" OR "hack" OR "no good tool" OR "spreadsheet" OR "manual process")${includePart}${excludePart}`);
  }

  const allRawResults: SearchResultRecord[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    try {
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'google');
      url.searchParams.set('q', query);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('num', depth === 'deep' ? '15' : '10');

      if (params.geographicMarket) {
        url.searchParams.set('gl', params.geographicMarket.toLowerCase().slice(0, 2));
      }

      const response = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`SerpApi search failed for query [${query}]:`, response.status, errorText);
        // If 401 or invalid key, throw immediately
        if (response.status === 401 || response.status === 403) {
          throw new Error(`SerpApi authentication error (${response.status}): Invalid API key or quota exceeded.`);
        }
        continue;
      }

      const data = await response.json() as {
        organic_results?: Array<{
          title?: string;
          link?: string;
          snippet?: string;
          date?: string;
          publication_date?: string;
        }>;
      };

      const organic = data.organic_results || [];

      for (const item of organic) {
        if (!item.link || !item.title) continue;
        
        const canonical = canonicalizeUrl(item.link);
        if (seenUrls.has(canonical)) continue;
        seenUrls.add(canonical);

        const domain = extractDomain(canonical);
        const snippet = cleanSnippet(item.snippet || '');
        const publishedDate = item.date || item.publication_date || undefined;
        const sourceType = detectSourceType(canonical, item.title);

        allRawResults.push({
          id: uuidv4(),
          researchId,
          title: item.title.trim(),
          url: canonical,
          domain,
          snippet,
          publishedDate,
          sourceQuery: query,
          sourceType,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('authentication error')) {
        throw err;
      }
      console.warn(`Error querying SerpApi for "${query}":`, msg);
    }
  }

  return {
    results: allRawResults,
    queriesExecuted: queries,
    totalRetrieved: allRawResults.length,
    deduplicatedCount: allRawResults.length
  };
}
