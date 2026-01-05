
import { RSSFeed } from '../types';

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';
export const ROKSANA_FEED_URL = 'https://news.google.com/rss/search?q=Roksana+Wegiel&hl=pl-PL&gl=PL&ceid=PL:pl';

export const fetchFeed = async (url: string = ROKSANA_FEED_URL): Promise<RSSFeed> => {
  try {
    const response = await fetch(`${RSS2JSON_API}${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Failed to fetch feed');
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(data.message || 'Error parsing RSS feed');
    }

    return {
      url,
      title: 'Roksana Węgiel News',
      items: data.items,
    };
  } catch (error) {
    console.error('RSS Fetch Error:', error);
    throw error;
  }
};
