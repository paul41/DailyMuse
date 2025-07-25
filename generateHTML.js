const fs = require('fs');
const raw = fs.readFileSync('data.json','utf-8');
const data = JSON.parse(raw);
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
  <h1>📊 Fetched API Data</h1>
  ${data.map((entry, i) => `
    <div class="card">
      <h2>API ${i + 1}</h2>
      <pre>${JSON.stringify(entry, null, 2)}</pre>
      ${entry.message ? `<img src="${entry.message}" alt="Dog Image" />` : ''}
    </div>
  `).join('')}
</body>
</html>`
fs.writeFileSync('index.html', html);
console.log('✅ HTML generated: index.html');