const fs = require('fs');
const raw = fs.readFileSync('data.json','utf-8');
const RSSLinkExtractor = require('./extractor');
const {startGeminiChat} = require('./smart-summary')
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
                    --bg-color: #4f4f4f;
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
                    gap: 16px;
                    padding: 0 16px 32px;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    flex-wrap: nowrap;
                }

                .card {
                    flex: 0 0 100%;
                    max-width: 100%;
                    background: var(--card-bg);
                    border-radius: 14px;
                    padding: 14px;
                    box-shadow: var(--shadow);
                    transition: transform 0.2s ease;
                }
                .card-container::-webkit-scrollbar {
                    height: 8px;
                }
                .card-container::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.2);
                    border-radius: 4px;
                }
                .card:hover {
                    transform: translateY(-4px);
                }

                .card img {
                    width: 100%;
                    height: 200px; /* Adjust height as needed */
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    background-color: var(--bg-color);
                }

                .card h3 {
                    font-size: 15px;
                    margin: 0 0 6px;
                    font-weight: 600;
                }

                .read-more {
                    display: inline-block;
                    background-color: var(--link-color);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: background 0.3s ease;
                }

                .read-more:hover {
                   background-color: var(--hover-link-color);
                }
                .card-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 10px;
                }
                .verdict-reactions {
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch; /* Changed from center to stretch */
                    box-sizing: border-box;
                    margin: 0 9px;
                    padding: 3px;
                    box-shadow: 0px -2px 5px 1px #888888;
                }

                    .verdict-btn {
                    flex: 1;
                    max-width: 50%;
                    background: linear-gradient(135deg, #4e54c8, #8f94fb);
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 16px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(78, 84, 200, 0.3);
                    cursor: pointer;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    opacity: 0.9;
                    }
                verdict-btn:hover {
                    background-color: var(--border-color);
                    color: var(--link-color);
                }
                #ai-ltr{
                    border 1px solid blue
                }
                .reaction-bar {
                    display: flex;
                    padding:5px;
                    gap: 12px;
                    justify-content: flex-end;
                    font-size: 0.9rem;
                    opacity: 0.85;
                    margin-left: auto;
                    flex-wrap: wrap;
                }

                .reaction {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: var(--border-color);
                    padding: 4px 8px;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .reaction:hover {
                    background: var(--hover-link-color);
                    color: #fff;
                }
                .reaction-count {
                    font-weight: 500;
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
               /* Tablet: 2 cards per screen */
                @media (min-width: 768px) {
                    .card {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                }

                /* Large desktop: 3 cards per screen */
                @media (min-width: 1200px) {
                    .card {
                        flex: 0 0 33.333%;
                        max-width: 33.333%;
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
            <script>
                function summaryFunction(){
                    console.log('Hiiiiiiiiiiiiiiiiiiii')
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
                            : `<img src="${content?.enclosure?.['$']?.url || content?.StoryImage || content?.mediaContent?.['$']?.url || `noImg.png`}" alt="Headline image" />`;
                            return `
                            <div class="card">
                                ${imgHTML}
                                <h3>${content?.title}</h3>
                                <div class="card-actions">
                                    <a href="${content?.link}" class="read-more" target="_blank">Read More →</a></br>
                                    <div class="verdict-reactions">
                                        <button class="verdict-btn" onClick=${startGeminiChat()}>Smart Summary</button>
                                        <div class="reaction-bar">
                                            <span class="reaction">👍 <span class="reaction-count">24</span></span>
                                            <span class="reaction">👎 <span class="reaction-count">3</span></span>
                                            <span class="reaction">💬 <span class="reaction-count">5</span></span>
                                        </div>
                                    </div>
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