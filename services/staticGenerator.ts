import type { SiteData, Article, Page } from '../types';

// HTML テンプレート生成
const generateHTMLPage = (
  title: string,
  content: string,
  siteData: SiteData,
  isArticle = false,
  article?: Article
): string => {
  const themeColors = {
    blue: '#2563eb',
    green: '#16a34a',
    purple: '#9333ea',
    red: '#dc2626',
    indigo: '#4f46e5'
  };

  const primaryColor = themeColors[siteData.themeColor] || themeColors.blue;

  const convertMarkdownToHTML = (markdown: string): string => {
    return markdown
      .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.875rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: ' + primaryColor + ';">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: ' + primaryColor + ';">$1</h3>')
      .replace(/^\* (.+)$/gm, '<li style="margin-left: 1.25rem; list-style-type: disc; margin-bottom: 0.5rem;">$1</li>')
      .replace(/^([^<\n*#].+)$/gm, '<p style="margin: 0.75rem 0; line-height: 1.625;">$1</p>')
      .replace(/(<li[^>]*>.*?<\/li>)/gs, '<ul style="margin: 1rem 0; padding-left: 1.5rem;">$1</ul>');
  };

  const navigation = `
    <nav style="margin-bottom: 2rem;">
      <a href="index.html" style="margin-right: 1rem; padding: 0.5rem 1rem; text-decoration: none; color: ${primaryColor}; background-color: #f3f4f6; border-radius: 0.375rem;">Home</a>
      <a href="about.html" style="margin-right: 1rem; padding: 0.5rem 1rem; text-decoration: none; color: ${primaryColor}; background-color: #f3f4f6; border-radius: 0.375rem;">About</a>
      <a href="blog.html" style="margin-right: 1rem; padding: 0.5rem 1rem; text-decoration: none; color: ${primaryColor}; background-color: #f3f4f6; border-radius: 0.375rem;">Blog</a>
    </nav>
  `;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${siteData.siteName}</title>
    <meta name="description" content="${isArticle && article ? article.metaDescription : `${siteData.siteName} - ${title}`}">
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        h1 { color: ${primaryColor}; font-size: 2.5rem; margin-bottom: 1rem; }
        nav a:hover { background-color: #e5e7eb; }
        .back-link { color: ${primaryColor}; text-decoration: none; margin-bottom: 1rem; display: inline-block; }
        .article-meta { color: #6b7280; font-style: italic; margin-bottom: 1.5rem; }
        ul { margin: 1rem 0; }
        li { margin-bottom: 0.25rem; }
    </style>
</head>
<body>
    <div class="container">
        ${navigation}
        ${isArticle ? `<a href="blog.html" class="back-link">← ブログ一覧に戻る</a>` : ''}
        <h1>${title}</h1>
        ${isArticle && article ? `<div class="article-meta">${article.metaDescription}</div>` : ''}
        <div class="content">
            ${convertMarkdownToHTML(content)}
        </div>
    </div>
</body>
</html>`;
};

// 個別ファイルダウンロード機能
export const downloadFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// メインの生成関数
export const generateStaticSite = async (siteData: SiteData): Promise<void> => {
  try {
    // 各ページを生成してダウンロード
    for (const page of siteData.pages) {
      if (page.path === '/blog') {
        // ブログ一覧ページ
        const blogContent = page.content + '\n\n' + 
          page.articles.map(article => 
            `## [${article.title}](articles/${article.slug}.html)\n\n${article.metaDescription}\n\n---\n`
          ).join('\n');
        
        const blogHTML = generateHTMLPage(page.title, blogContent, siteData);
        downloadFile('blog.html', blogHTML);

        // 少し遅延を入れて連続ダウンロード
        await new Promise(resolve => setTimeout(resolve, 500));

        // 各記事をダウンロード
        for (const article of page.articles) {
          const articleHTML = generateHTMLPage(article.title, article.content, siteData, true, article);
          downloadFile(`${article.slug}.html`, articleHTML);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        // 通常のページ
        const fileName = page.path === '/' ? 'index.html' : `${page.path.substring(1)}.html`;
        const pageHTML = generateHTMLPage(page.title, page.content, siteData);
        downloadFile(fileName, pageHTML);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    alert('全てのHTMLファイルのダウンロードが完了しました！');

  } catch (error) {
    console.error('エクスポートエラー:', error);
    throw new Error('サイトのエクスポートに失敗しました');
  }
};