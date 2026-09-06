import type { EventItem } from './events';

/**
 * ScrapedItem is unified with EventItem to maintain a single data contract
 * across both the live feed and the staging queue (X5).
 */
export type ScrapedItem = EventItem;

