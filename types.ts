
export interface RSSItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: any;
  categories: string[];
}

export interface RSSFeed {
  url: string;
  title: string;
  items: RSSItem[];
}
