const fs = require('fs');
const raw = fs.readFileSync('data.json','utf-8');
const RSSLinkExtractor = require('./extractor');
const xmlContent = JSON.parse(raw);

(async ()=>{
    const extractor = new RSSLinkExtractor(xmlContent);
    const contents = await extractor.extractLinks();
    console.log(contents)
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
        <title>Fetched API Dashboard</title>
        <style>
            body { font-family: sans-serif; padding: 20px; }
            .card { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 6px; }
            img { max-width: 300px; margin-top: 10px; }
        </style>
        </head>
        <body>
        <h1>📊 Top 5 news Data</h1>
        ${params.map((entry, i) => `
            <div class="card" name=${i+1}>
            <h2>
                <a href="${entry.link}" target="_blank">${entry.title}</a>
            </h2>
            <b><em>${entry.pubDate}</em></b>
            <pre></pre>
            <img src="${entry.image}" alt="Dog Image" />
            </div>
        `).join('')}
        </body>
    </html>`
    fs.writeFileSync('index.html', html);
}