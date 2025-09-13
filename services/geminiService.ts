import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SiteData, Article } from '../types';

// 環境変数からAPIキーを取得
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Gemini API key not found. Please set GEMINI_API_KEY environment variable.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const generateSeoSite = async (siteName: string, siteKeywords: string): Promise<SiteData> => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to environment variables.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert SEO content strategist and web designer.
    Generate a complete data structure for a professional, SEO-optimized website.
    The site name is "${siteName}".
    The primary keywords for the site are: "${siteKeywords}".

    Please provide the following in JSON format:
    {
      "siteName": "refined site name",
      "themeColor": "blue|green|purple|red|indigo",
      "pages": [
        {
          "path": "/",
          "title": "Home",
          "content": "Home page content in Markdown format",
          "articles": []
        },
        {
          "path": "/about",
          "title": "About Us", 
          "content": "About page content in Markdown format",
          "articles": []
        },
        {
          "path": "/blog",
          "title": "Blog",
          "content": "Blog introduction content in Markdown format",
          "articles": [
            {
              "slug": "article-slug-1",
              "title": "Article Title 1",
              "content": "Article content in Markdown with ## headings and * lists",
              "metaDescription": "SEO description around 150 characters"
            },
            {
              "slug": "article-slug-2",
              "title": "Article Title 2", 
              "content": "Article content in Markdown with ## headings and * lists",
              "metaDescription": "SEO description around 150 characters"
            },
            {
              "slug": "article-slug-3",
              "title": "Article Title 3",
              "content": "Article content in Markdown with ## headings and * lists", 
              "metaDescription": "SEO description around 150 characters"
            }
          ]
        }
      ]
    }

    Make sure to generate exactly 3 articles for the blog page. Each article should be substantial with multiple sections, headings (##, ###), and lists (*).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('AI Response:', text);
    
    // JSONを抽出
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    
    const siteData = JSON.parse(jsonString.trim()) as SiteData;
    
    // データ検証
    if (!siteData.pages || siteData.pages.length < 3) {
      throw new Error('Generated site data is incomplete');
    }
    
    const blogPage = siteData.pages.find(p => p.path === '/blog');
    if (!blogPage || !blogPage.articles || blogPage.articles.length < 3) {
      throw new Error('Blog page must have exactly 3 articles');
    }
    
    return siteData;
    
  } catch (error) {
    console.error('Error generating site data:', error);
    throw new Error(`Failed to generate site data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const generateNewArticles = async (articleKeywords: string, existingTitles: string[]): Promise<Article[]> => {
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Generate 3 new, unique blog articles based on these keywords: "${articleKeywords}"
    
    IMPORTANT: Do NOT create articles with titles similar to these existing ones:
    ${existingTitles.map(t => `- "${t}"`).join('\n')}
    
    Return JSON format:
    [
      {
        "slug": "url-friendly-slug-1",
        "title": "Unique Article Title 1",
        "content": "Full article content with ## headings and * lists in Markdown",
        "metaDescription": "SEO description around 150 characters"
      },
      {
        "slug": "url-friendly-slug-2", 
        "title": "Unique Article Title 2",
        "content": "Full article content with ## headings and * lists in Markdown",
        "metaDescription": "SEO description around 150 characters"
      },
      {
        "slug": "url-friendly-slug-3",
        "title": "Unique Article Title 3",
        "content": "Full article content with ## headings and * lists in Markdown",
        "metaDescription": "SEO description around 150 characters"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    
    const articles = JSON.parse(jsonString.trim()) as Article[];
    
    if (!Array.isArray(articles) || articles.length !== 3) {
      throw new Error('Must generate exactly 3 articles');
    }
    
    return articles;
    
  } catch (error) {
    console.error('Error generating articles:', error);
    throw new Error(`Failed to generate articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};