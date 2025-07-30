const fs = require('fs');
const raw = fs.readFileSync('data.json','utf-8');
const RSSLinkExtractor = require('./extractor');
const xmlContent = JSON.parse(raw);

(async ()=>{
    const extractor = new RSSLinkExtractor(xmlContent);
    const contents = await extractor.extractLinks();  
    await updateHTML(contents).then(data=>console.log('✅ HTML generated: index.html')).catch(err=>{
        console.error('Error updating HTML');
        process.exit(1);
    });
})();

async function updateHTML(params) {
    const html = `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>Daily Muse | Daily NEWS headlines</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="Webpage that display news headlines from top 5 Indian news channels." />
            <meta name="author" content="SouravPaul" />
           <style>
                :root {
                    --bg-color: #f0f2f5;
                    --text-color: #222;
                    --card-bg: #ffffff;
                    --link-color: #0078D4;
                    --hover-link-color: #005a99;
                    --border-color: #e5e7eb;
                    --shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }

                body.dark {
                    --bg-color: #121212;
                    --text-color: #e0e0e0;
                    --card-bg: #1f1f1f;
                    --link-color: #66aaff;
                    --hover-link-color: #99cfff;
                    --border-color: #2a2a2a;
                    --shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                }

                body {
                    margin: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: var(--bg-color);
                    color: var(--text-color);
                    transition: background 0.3s ease, color 0.3s ease;
                }

                .header-stt {
                    background: var(--card-bg);
                    box-shadow: var(--shadow);
                    text-align: center;
                    padding: 7px 0;
                    margin-bottom: 20px;
                }

                .app-logo {
                    width: 125px;
                    height: auto;
                }

                .theme-toggle {
                    display: flex;
                    justify-content: flex-end;
                    padding: 0 16px;
                    margin-top: -40px;
                    margin-bottom: 20px;
                }

                #toggleTheme {
                    background: var(--card-bg);
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.3s;
                }

                #toggleTheme:hover {
                    background: var(--border-color);
                }

                .news-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--card-bg);
                    box-shadow: var(--shadow);
                    border-radius: 12px;
                    margin: 20px auto;
                    max-width: 960px;
                }

                .news-header img {
                    width: 100px;
                    height: 100px;
                    object-fit: contain;
                    border-radius: 8px;
                    background: #ccc;
                }

                .news-header-stt {
                    flex: 1;
                }

                .news-title {
                    font-size: 1.1rem;
                    margin: 0 0 6px;
                    color: var(--text-color);
                }

                .news-date {
                    font-size: 0.85rem;
                    color: #888;
                    text-transform: uppercase;
                }

                .card-container {
                    display: flex;
                    gap: 12px;
                    padding: 0 16px 32px;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                }
                .card-container::-webkit-scrollbar {
                    height: 8px;
                }
                .card-container::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.2);
                    border-radius: 4px;
                }

                .card {
                    min-width: 220px;
                    background: var(--card-bg);
                    border-radius: 14px;
                    padding: 14px;
                    box-shadow: var(--shadow);
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }

                .card:hover {
                    transform: translateY(-4px);
                }

                .card img {
                    width: 100%;
                    height: 120px;
                    background:var(--bg-color);
                    object-fit: contain;
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .card h3 {
                    font-size: 15px;
                    margin: 0 0 6px;
                    font-weight: 600;
                }

                .read-more {
                    text-decoration: none;
                    color: var(--link-color);
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .read-more:hover {
                    color: var(--hover-link-color);
                }
                .card-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 10px;
                }

                .verdict-btn {
                    padding: 6px 10px;
                    font-size: 0.9rem;
                    border: 1px solid var(--border-color);
                    background-color: transparent;
                    color: var(--text-color);
                    border-radius: 6px;
                    cursor: not-allowed;
                    transition: background 0.2s ease;
                    opacity: 0.6;
                }

                .verdict-btn:hover {
                    background-color: var(--border-color);
                }
                .footer {
                    padding: 32px 0;
                    text-align: center;
                    font-size: 0.95rem;
                    color: var(--text-color);
                    border-top: 1px solid var(--border-color);
                    margin-top: 40px;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 12px 0 20px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 16px;
                }

                .footer-links a {
                    text-decoration: none;
                    color: var(--link-color);
                }

                .footer-links a:hover {
                    color: var(--hover-link-color);
                }

                @media (max-width: 600px) {
                    .news-header {
                        flex-direction: column;
                        text-align: center;
                    }
                    .card-container {
                        padding-left: 8px;
                        padding-right: 8px;
                    }
                }
            </style>

            <script type="text/javascript">
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "slvrquufd1");
            </script>

            <script>
                window.onload = function () {
                    const toggle = document.getElementById("toggleTheme");
                    const currentTheme = localStorage.getItem("theme");

                    if (currentTheme === "dark") {
                        document.body.classList.add("dark");
                    }

                    toggle.addEventListener("click", () => {
                        document.body.classList.toggle("dark");
                        const theme = document.body.classList.contains("dark") ? "dark" : "light";
                        localStorage.setItem("theme", theme);
                    });
                }
            </script>
        </head>
        <body>
            <h1 class="header-stt">
                <img src="dailyMicon.png" alt="" class="app-logo" />
            </h1>
            <div class="theme-toggle">
                <button id="toggleTheme">🌓 Toggle Theme</button>
            </div>
   
            ${params.map((entry, i) => `
                <div class="news-header">
                    <img src="${entry.image}" alt="News Logo">
                    <div class="news-header-stt">
                        <h3 class="news-title">
                            <a href="${entry.link}" target="_blank">${entry.title}</a>
                        </h3>
                        <p class="news-date">${entry.pubDate}</p>
                    </div>
                </div>
                    <div class="card-container">
                        ${entry['headlines'].map((content, i) => {
                            const imgHTML = content?.['description']?.match(/<img[^>]+src=(["'])(.*?)\1/)
                            ? `<img src="${content?.['description']?.match(/<img[^>]+src=(["'])(.*?)\1/)[2]}" alt="Headline image"/>`
                            : `<img src="${content?.enclosure?.['$']?.url || content?.StoryImage || content?.mediaContent?.['$']?.url || `imageUnavailable.png`}" alt="Headline image" />`;
                            return `
                            <div class="card">
                                ${imgHTML}
                                <h3>${content?.title}</h3>
                                <div class="card-actions">
                                    <a href="${content?.link}" class="read-more" target="_blank">Read More →</a>
                                    <button class="verdict-btn" disabled>🗣️ AI Verdict</button>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
            `).join('')}

            <footer class="footer">
                <div class="container">
                    <b>DailyMuse · One brilliant headliner, delivered daily </b></p>
                    <ul class="footer-links">
                        <li><a href="javascript:void(0)">About</a></li>
                        <li><a href="javascript:void(0)">Privacy</a></li>
                        <li><a href="https://github.com/paul41/DailyMuse">GitHub</a></li>
                        <li><a href="mailto:sourav03.paul29@gmail.com">
                                Contact
                            </a>
                        </li>
                        <li>
                            <a href="javascript:void(0)" title="Subscribe for a 3-minute morning news brief. "> Subscribe </a>
                        </li>
                    </ul>
                    <p class="copyright">© 2025 DailyMuse. Powered by GitHub Actions.</p>
                </div>
            </footer>

        </body>
    </html>`
    fs.writeFileSync('index.html', html);
}