export interface Article {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
}

export interface Page {
  path: string;
  title: string;
  content: string;
  articles: Article[];
}

export interface SiteData {
  siteName: string;
  pages: Page[];
  themeColor: 'blue' | 'green' | 'purple' | 'red' | 'indigo';
}