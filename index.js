const axios = require('axios');
const fs = require('fs');

(async()=>{
    const endpoints = [
        'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        'https://feeds.feedburner.com/NDTV-LatestNews',
        'https://www.indiatoday.in/rss/1206578',
        'https://www.thehindu.com/news/national/?service=rss',
        'https://www.cnbctv18.com/commonfeeds/v1/cne/rss/business.xml'
    ];
    try {
        const data = await Promise.all(endpoints.map(url=>axios.get(url).then(res => res.data)));
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        console.log('✅ Data saved to data.json');
    } catch (error) {
        console.error('❌ Fetch error:', err);
        process.exit(1);
    }
})()