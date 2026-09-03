export type ScrapedItem = {
  id: string;
  image: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  tags: string[];
  confidence: number;
  sourceHandle: string;
  sourceTimestamp: string;
  rawCaption: string;
  eventType: string;
};

