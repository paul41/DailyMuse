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
            <title>Daily NEWS highlights</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content="Webpage that displays headlines from top 5 indian channels. Refreshed each day" />
            <meta name="author" content="souravPaul" />
            <style>
                /* CSS */
                body { font-family: Arial,sans-serif; padding: 20px; background:#ddd }
                .news-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .news-header img {
                    width: 120px;
                    height: 120px;
                    object-fit: contain;
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
                    border-radius: 8px;
                }

                .card-container {
                    display: flex;
                    justify-content: space-between; /* ensures even spacing across all cards */
                    gap: 16px;
                    flex-wrap: nowrap; /* forces cards to stay on one line */
                    margin-bottom: 20px;
                    overflow-x: auto; /* enables scrolling if cards overflow */
                }
                .card {
                    min-width: 200px;
                    max-width: 200px;
                    flex-shrink: 0; /* prevents cards from shrinking */
                    background-color: #f1f1f1;
                    border-radius: 8px;
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
            </style>
        </head>
        <body>
        <h1>📰 Today's Finds</h1>
        ${params.map((entry, i) => `
            <div class="news-header">
                <img src="${entry.image}" alt="News Logo">
                <h3 class="news-title">
                    <a href="${entry.link}" target="_blank">${entry.title}</a>
                </h3>
                <p class="news-date">${entry.pubDate}</p>
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
        </body>
    </html>`
    fs.writeFileSync('index.html', html);
    //<img src="image1.jpg" alt="News 1">
}