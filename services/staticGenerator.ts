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
      .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.875rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: ' + primaryColor + '; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 style="font-size: 1.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: ' + primaryColor + ';">$1</h3>')
      .replace(/^\* (.+)$/gm, '<li style="margin-bottom: 0.5rem; line-height: 1.6;">$1</li>')
      .replace(/^([^<\n*#].+)$/gm, '<p style="margin: 0.75rem 0; line-height: 1.625; color: #374151;">$1</p>')
      .replace(/(<li[^>]*>.*?<\/li>)/gs, '<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">$1</ul>');
  };

  // ブログページの場合の記事カード生成
  let articleCards = '';
  if (title === 'Blog' && siteData.pages.find(p => p.path === '/blog')?.articles) {
    const articles = siteData.pages.find(p => p.path === '/blog')!.articles;
    articleCards = `
      <div style="margin-top: 2rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          ${articles.map(article => `
            <div style="background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; transition: transform 0.2s, box-shadow 0.2s;">
              <h3 style="font-size: 1.25rem; font-weight: bold; color: ${primaryColor}; margin-bottom: 0.5rem;">
                <a href="${article.slug}.html" style="text-decoration: none; color: inherit;">${article.title}</a>
              </h3>
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0.5rem 0 1rem 0; line-height: 1.5;">${article.metaDescription}</p>
              <a href="${article.slug}.html" style="font-size: 0.875rem; font-weight: 600; color: ${primaryColor}; text-decoration: none;">記事を読む →</a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${siteData.siteName}</title>
    <meta name="description" content="${isArticle && article ? article.metaDescription : `${siteData.siteName} - ${title}`}">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
        }
        
        .header {
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${primaryColor};
            text-decoration: none;
        }
        
        .nav {
            display: flex;
            gap: 1rem;
        }
        
        .nav a {
            padding: 0.5rem 1rem;
            text-decoration: none;
            color: #4b5563;
            background-color: #f3f4f6;
            border-radius: 0.375rem;
            font-weight: 500;
            transition: background-color 0.15s;
        }
        
        .nav a:hover {
            background-color: #e5e7eb;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        
        .content {
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: ${primaryColor};
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        
        .back-link {
            color: ${primaryColor};
            text-decoration: none;
            margin-bottom: 1rem;
            display: inline-block;
            font-size: 0.875rem;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
        
        .article-meta {
            color: #6b7280;
            font-style: italic;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background-color: #f8fafc;
            border-radius: 0.375rem;
            border-left: 4px solid ${primaryColor};
        }
        
        .footer {
            background-color: #374151;
            color: white;
            text-align: center;
            padding: 2rem 1rem;
            margin-top: 3rem;
        }
        
        /* モバイル対応 */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            .nav {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .container {
                padding: 1rem 0.5rem;
            }
            
            .content {
                padding: 1rem;
            }
            
            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="index.html" class="logo">${siteData.siteName}</a>
            <nav class="nav">
                <a href="index.html">Home</a>
                <a href="about.html">About Us</a>
                <a href="blog.html">News</a>
            </nav>
        </div>
    </header>

    <main class="container">
        <div class="content">
            ${isArticle ? `<a href="blog.html" class="back-link">← ブログ一覧に戻る</a>` : ''}
            <h1>${title}</h1>
            ${isArticle && article ? `<div class="article-meta">${article.metaDescription}</div>` : ''}
            <div class="content-body">
                ${convertMarkdownToHTML(content)}
                ${articleCards}
            </div>
        </div>
    </main>

    <footer class="footer">
        <p>&copy; 2025 ${siteData.siteName}. All rights reserved.</p>
    </footer>
</body>
</html>`;
};

// 個別ファイルダウンロード機能
export const downloadFile = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = window.URL.createObjectURL(blob); // ← この行を修正
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
// メインの生成関数
export const generateStaticSite = async (siteData: SiteData): Promise<void> => {
  try {
    let downloadCount = 0;
    const totalFiles = siteData.pages.length + (siteData.pages.find(p => p.path === '/blog')?.articles.length || 0);

    // 各ページを生成してダウンロード
    for (const page of siteData.pages) {
      if (page.path === '/blog') {
        // ブログ一覧ページ
        const blogHTML = generateHTMLPage(page.title, page.content, siteData);
        downloadFile('blog.html', blogHTML);
        downloadCount++;

        // 少し遅延を入れて連続ダウンロード
        await new Promise(resolve => setTimeout(resolve, 800));

        // 各記事をダウンロード
        for (const article of page.articles) {
          const articleHTML = generateHTMLPage(article.title, article.content, siteData, true, article);
          downloadFile(`${article.slug}.html`, articleHTML);
          downloadCount++;
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } else {
        // 通常のページ
        const fileName = page.path === '/' ? 'index.html' : `${page.path.substring(1)}.html`;
        const pageHTML = generateHTMLPage(page.title, page.content, siteData);
        downloadFile(fileName, pageHTML);
        downloadCount++;
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    // 完了メッセージ
    alert(`${downloadCount}個のHTMLファイルのダウンロードが完了しました！\n\nファイルをFTPソフトでサーバーにアップロードしてください。`);

  } catch (error) {
    console.error('エクスポートエラー:', error);
    alert('エクスポートに失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
  }
};