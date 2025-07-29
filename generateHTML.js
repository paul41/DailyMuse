const fs = require('fs');
const raw = fs.readFileSync('data.json','utf-8');
const RSSLinkExtractor = require('./extractor');
const xmlContent = JSON.parse(raw);

(async ()=>{
    const extractor = new RSSLinkExtractor(xmlContent);
    const contents = await extractor.extractLinks();
    //console.log(contents[3].headlines);
    
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
                /* CSS */
                body { font-family: Arial,sans-serif; padding: 15px; background:#ddd }
                .news-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 18px;
                }
                .header-stt{
                    background:#fff;
                    padding-top:7px;
                    box-shadow:0 2px 8px rgba(0, 0, 0, 0.1);
                    text-align:center;
                }
                .news-header img {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
                    border-radius: 5px;
                    background:#ccc9c9
                }
                news-header-stt{
                    display:block;
                }
                .news-title {
                    font-size: 1.2rem;
                    margin: 0 0 8px;
                    color: #333;
                }
                .news-card:hover {
                    transform: translateY(-5px);
                }

                .news-image {
                    width: 100%;
                    height: 200px;
                    object-fit: contain;
                    border-radius: 5px;
                    border:1px solid #ddd
                }
                .news-date {
                    font-family: Arial,sans-serif;
                    font-size: 0.95rem;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1em;
                    display: block;
                }
                .app-logo {
                    width: 120px;
                    height: 120px;
                }
                .card-container {
                    display: flex;
                    justify-content: space-between; /* ensures even spacing across all cards */
                    gap: 16px;
                    flex-wrap: nowrap; /* forces cards to stay on one line */
                    margin-bottom: 15px;
                    overflow-x: auto; /* enables scrolling if cards overflow */
                }
                .card {
                    min-width: 200px;
                    max-width: 200px;
                    flex-shrink: 0; /* prevents cards from shrinking */
                    background-color: #f1f1f1;
                    border-radius: 17px 17px 0 0;
                    padding: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .card img {
                    width: 100%;
                    height: 120px;
                    object-fit: contain;
                    border-radius: 4px;
                }
                .card h3 {
                    font-size: 16px;
                    margin-top: 8px;
                }
                .card p {
                    font-size: 14px;
                    color: #555;
                }
                .read-more {
                    text-decoration: none;
                    color: #0078D4;
                    font-weight: bold;
                }
                .footer {
                    background-color: #f9f9f9;
                    padding: 24px 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #333;
                    text-align: center;
                    border-top: 1px solid #e0e0e0;
                }

                .footer .container {
                    max-width: 960px;
                    margin: 0 auto;
                    padding: 0 16px;
                }

                .footer .container p {
                    margin: 8px 0;
                    font-size: 0.95rem;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 12px 0;
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                }

                .footer-links li a {
                    text-decoration: none;
                    color: #007acc;
                    font-weight: 500;
                    transition: color 0.2s ease-in-out;
                }

                .footer-links li a:hover {
                    color: #005a99;
                    text-decoration: underline;
                }

                .copyright {
                    font-size: 0.85rem;
                    color: #666;
                    margin-top: 12px;
                }
            </style>
            <script type="text/javascript">
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "slvrquufd1");
            </script>
        </head>
        <body>
            <h1 class="header-stt">
                <img src="dailyMicon.png" alt="" class="app-logo" />
            </h1>   
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
                        ${entry['headlines'].map((content,i)=>`
                            <div class="card">
                                <img src="${content?.enclosure?.['$']?.url || content?.StoryImage || content?.["media:content"]?.['$']?.url}" alt="Headline image">
                                <h3>${content?.title}</h3>
                                <a href="${content?.link}" class="read-more" target="_blank">Read More →</a>
                            </div>   
                        `).join('')}
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
                    </ul>
                    <p class="copyright">© 2025 DailyMuse. Powered by GitHub Actions.</p>
                </div>
            </footer>

        </body>
    </html>`
    fs.writeFileSync('index.html', html);
}