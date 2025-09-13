import { GoogleGenAI, Type } from "@google/genai";
import type { SiteData, Article } from '../types';

// The API key is sourced from `process.env.API_KEY` and is a hard requirement.
// As per guidelines, we assume it is pre-configured and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
// FIX: Use the recommended model for general text tasks.
const model = 'gemini-2.5-flash';

const siteSchema = {
  type: Type.OBJECT,
  properties: {
    siteName: { type: Type.STRING, description: "The name of the website." },
    themeColor: {
      type: Type.STRING,
      enum: ['blue', 'green', 'purple', 'red', 'indigo'],
      description: 'A theme color for the website design, chosen from the provided list.'
    },
    pages: {
      type: Type.ARRAY,
      description: "An array of pages for the website. Must include Home, About, and Blog.",
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: 'URL path, e.g., "/" for home, "/about", "/blog".' },
          title: { type: Type.STRING, description: "The title of the page." },
          content: { type: Type.STRING, description: 'Page content in Markdown format. For the blog page, this should be an introduction to the blog.' },
          articles: {
            type: Type.ARRAY,
            description: 'Only for the blog page (path: "/blog"). Other pages must have an empty array. Generate 3 initial articles.',
            items: {
              type: Type.OBJECT,
              properties: {
                slug: { type: Type.STRING, description: 'A URL-friendly slug for the article based on its title (e.g., "my-first-post").' },
                title: { type: Type.STRING, description: "The title of the article." },
                content: { type: Type.STRING, description: 'Article content in Markdown format, well-structured with headings (e.g., ## Title) and lists (e.g., * item).' },
                metaDescription: { type: Type.STRING, description: 'A short, SEO-friendly summary of the article, around 150 characters.' },
              },
              required: ['slug', 'title', 'content', 'metaDescription'],
            },
          },
        },
        required: ['path', 'title', 'content', 'articles'],
      },
    },
  },
  required: ['siteName', 'themeColor', 'pages'],
};

const articlesSchema = {
  type: Type.ARRAY,
  description: "An array of 3 new blog articles.",
  items: {
    type: Type.OBJECT,
    properties: {
      slug: { type: Type.STRING, description: 'A URL-friendly slug for the article based on its title (e.g., "my-new-post").' },
      title: { type: Type.STRING, description: "The title of the article." },
      content: { type: Type.STRING, description: 'Article content in Markdown format, well-structured with headings (e.g., ## Title) and lists (e.g., * item).' },
      metaDescription: { type: Type.STRING, description: 'A short, SEO-friendly summary of the article, around 150 characters.' },
    },
    required: ['slug', 'title', 'content', 'metaDescription'],
  },
};


export const generateSeoSite = async (siteName: string, siteKeywords: string): Promise<SiteData> => {
  const prompt = `
    You are an expert SEO content strategist and web designer.
    Generate a complete data structure for a professional, SEO-optimized website.
    The site name is "${siteName}".
    The primary keywords for the site are: "${siteKeywords}".

    Please provide the following:
    1.  A slightly refined or creative version of the site name if you think it's better.
    2.  A theme color from the allowed options. Pick one that best fits the keywords.
    3.  A set of standard pages. I need a Home page ('/'), an About page ('/about'), and a Blog page ('/blog').
    4.  For each page, provide a path, a title, and content. The content should be well-written, engaging, and optimized for the given keywords. Use Markdown for formatting. For the blog page, the content should be a brief introduction to what the blog is about.
    5.  For the Blog page, generate 3 initial, high-quality, SEO-friendly articles related to the site keywords. Each article needs a URL-friendly slug, a compelling title, a meta description (around 150 characters), and full content in Markdown format. The content should be substantial and well-structured with headings and lists.

    Adhere strictly to the provided JSON schema for the response.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: siteSchema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as SiteData;
  } catch (error) {
    console.error('Error generating site data:', error);
    throw new Error('Failed to generate site data from the AI. The AI may have returned an invalid response or there was a network issue.');
  }
};

export const generateNewArticles = async (articleKeywords: string, existingTitles: string[]): Promise<Article[]> => {
  const prompt = `
    You are an expert SEO content writer.
    Your task is to generate 3 new, high-quality, SEO-friendly blog articles.
    The articles should be based on the following keywords: "${articleKeywords}".

    IMPORTANT: Do NOT generate articles with titles that are similar to the following existing titles:
    ${existingTitles.map(t => `- "${t}"`).join('\n')}

    For each of the 3 articles, provide:
    1. A URL-friendly slug based on the title.
    2. A compelling and unique title.
    3. A short, SEO-friendly meta description (around 150 characters).
    4. Full article content in Markdown format. The content should be substantial, well-structured with headings (##, ###) and lists (*), and provide real value to the reader.

    Adhere strictly to the provided JSON schema for the response.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: articlesSchema,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as Article[];
  } catch (error) {
    console.error('Error generating new articles:', error);
    throw new Error('Failed to generate new articles from the AI. The AI may have returned an invalid response or there was a network issue.');
  }
};
