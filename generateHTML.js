const fs = require('fs');
const raw = fs.readFileSync('data.json', 'utf-8');
const RSSLinkExtractor = require('./extractor');
const { error } = require('console');
const {findTrendingTopics} = require('./trendingTopics');
const xmlContent = JSON.parse(raw);
const extractor = new RSSLinkExtractor(xmlContent);
findTrendingTopics().then(async topics => {
    const contents = await extractor.extractLinks();
    const feeds = []
    topics.forEach(async (t, i) => {
        feeds.push(t)
    });
    console.log(feeds);
    
    await updateHTML(contents,feeds).then(data => console.log('✅ HTML generated: index.html')).catch(err => {
        console.error('Error updating HTML', err);
        process.exit(1);
    });
}
).catch(async err => {
    console.error("Error fetching trending topics: ", err) 
    const contents = await extractor.extractLinks();
    await updateHTML(contents).then(data => console.log('✅ HTML generated: index.html')).catch(err => {
        console.error('Error updating HTML', err);
        process.exit(1);
    });
});

async function updateHTML(params, topic) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Daily Muse | Daily NEWS headlines</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- GSAP -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

    <style>
        :root {
            --bg-color: #f0f2f5;
            --text-color: #222;
            --card-bg: #ffffff;
            --link-color: #0078D4;
            --hover-link-color: #005a99;
            --border-color: #e5e7eb;
            --shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        body.dark {
            --bg-color: #2f2f2f;
            --text-color: #e0e0e0;
            --card-bg: #1c1c1c;
            --border-color: #444;
        }

        body {
            margin: 0;
            font-family: "Segoe UI", sans-serif;
            background: var(--bg-color);
            color: var(--text-color);
            transition: 0.3s;
        }

        /***************************
            HEADER SECTION
        ***************************/
        .dm-header {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            padding: 18px 0;
            background: var(--card-bg);
            box-shadow: var(--shadow);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .dm-logo {
            width: 58px;
            height: 58px;
            object-fit: contain;
        }
        .dm-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .dm-title {
            font-size: 1.3rem;
            font-weight: 350;
            letter-spacing: -0.5px;
            color: #c55f17db;
            margin-bottom: 0;
        }

        /***************************
            HERO + CAROUSEL
        ***************************/
        .hero {
            width: 100%;
            max-width: 960px;
            margin: 0 auto;
            padding: 20px;
        }

        .carousel {
            width: auto;
            overflow: hidden;            
            box-shadow: var(--shadow);
            position: relative;
        }

        .carousel-slide {
            display: none;
        }
        .carousel-slide.active {
            display: block;
            cursor: pointer;
        }

        .carousel-slide img {
            width: 100%;
            height: 240px;
            object-fit: cover;
        }
        .carousel-caption {
                font-size: 0.75rem;
                text-align: center;   
                bottom: 20px;
                left: 15px;
                right: 15px;
                color: #fff;
                background: rgba(0,0,0,0.5);
                padding: 10px 14px;
                border-radius: 8px;
            }
      
        .section-title {
            max-width: 960px;
            margin: 30px auto 10px;
            padding: 0 16px;
            font-size: 1.5rem;
            text-align: center;
        }
        /***************************
            TRENDING
        ***************************/
        .trending {
            max-width: 960px;
            margin: 20px auto;
            padding: 0 16px;
        }

        .trend-card {
            padding: 16px;
            background: var(--card-bg);
            border-radius: 12px;
            margin-bottom: 16px;
            box-shadow: var(--shadow);
        }

        .heat { height: 4px; border-radius: 6px; margin-bottom: 8px; }
        .heat-1 { background: #ff5959; }
        .heat-2 { background: #ff884d; }
        .heat-3 { background: #ffd24d; }

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .card-header h3 {
            padding: 5px;
            margin: 0;
            flex: 1;
            font-size: 1rem;
        }

        .expand-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
            transition: transform 0.3s ease;
        }
        /* Hidden content */
        .card-content {
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height 0.4s ease, opacity 0.3s ease;
        }

        /* Expanded state */
        .trend-card.expanded .card-content {
            max-height: 600px;
            opacity: 1;
        }

        .trend-card.expanded .expand-btn {
            transform: rotate(180deg);
        }
        /* Content styling */
        .card-content p {
            margin-top: 12px;
            font-size: 0.9rem;
            color: #555;
        }

        .card-content img {
            width: 100%;
            margin-top: 8px;
            border-radius: 8px;
        }
        /***************************
            TOPICS
        ***************************/
        .topics {
            margin: 10px auto;
            padding: 0 16px;
            display: flex;
            gap: 16px;
            width: 80%;
        }

        .topic-card {
            flex: 1 1 calc(50% - 16px);
            background: var(--card-bg);
            padding: 15px;
            border-radius: 14px;
            border-color: var(--border-color);
            text-decoration: none;
            color:inherit;
            box-shadow: var(--shadow);
        }

        .topic-card:hover {
            background: #c55f17db;
            color: #fff;
            transform: translateY(-2px);
            cursor: pointer;
            transition: 0.2s;
        }

        .topic-card:active {
            transform: scale(0.95);
        }

        @media (min-width: 768px) {
            .topic-card { flex: 1 1 calc(25% - 16px); }
        }
        /***************************
            WEATHER METER
        ***************************/
       
        /***************************
            COMMUNITY
        ***************************/
        .community {
            max-width: 960px;
            margin: 20px auto;
            padding: 0 16px;
        }

        .quick-links {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        .quick-btn {
            cursor: pointer;
            padding: 10px 14px;
            background: var(--card-bg);
            border-radius: 10px;
            font-weight: 600;
            box-shadow: var(--shadow);
        }

        .digest-cards {
            display: flex;
            gap: 14px;
            overflow-x: auto;
        }

        .digest {
            min-width: 240px;
            padding: 14px;
            background: var(--card-bg);
            border-radius: 14px;
            box-shadow: var(--shadow);
        }

        /***************************
            NEWS CARDS
        ***************************/
        .news-header {
            max-width: 960px;
            margin: 20px auto 10px;
            padding: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 16px;
            background: var(--card-bg);
            box-shadow: var(--shadow);
        }

        .card-container {
            max-width: 960px;
            margin: 0 auto 30px;
            padding: 0 16px;
            display: flex;
            gap: 16px;
            overflow-x: auto;
        }

        .card {
            cursor: pointer;
            flex: 0 0 100%;
            background: var(--card-bg);
            border-radius: 14px;
            margin-block-end: 10px;
            box-shadow: var(--shadow);
        }
        .card img{
            border-radius: 14px 14px 0 0;
        }

        @media (min-width: 768px) {
            .card { flex: 0 0 50%; }
        }
        @media (min-width: 1200px) {
            .card { flex: 0 0 33%; }
        }
        .category-topics {
            display: grid;
            grid-auto-flow: column;
            grid-template-rows: repeat(2, auto); /* 🔥 auto, not 1fr */
            gap: 16px;
            padding: 12px;
            overflow-x: auto;
            overflow-y: hidden;
            align-items: start; /* prevents stretching */
        }

        .category-topic-card {
            background: #ede0d8f2;
            border-radius: 12px;
            padding: 16px;
            min-height: 140px;
            width: 200px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            scroll-snap-align: start;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .category-topic-card h3 {
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 10px;
        }
        .topic-header {
            text-align: center;
            margin: 20px 0 12px;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #c55f17db;
            position: relative;
            text-decoration:underline;
        }   
        .copied-label {
            top: 50px;
            position: absolute;
            left: 36%;
            transform: translateX(-50%);
            background: #16a34a;
            color: #fff;
            padding: 3px 8px;
            font-size: 11px;
            border-radius: 6px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .show .copied-label {
            opacity: 1;
        }
            /* Overlay */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1000;
        }

        /* Modal */
        .modal {
            background: #fff;
            padding: 24px;
            width: 320px;
            border-radius: 8px;
            text-align: center;
            transform: scale(0.8) translateY(20px);
            transition: transform 0.3s ease;
            position: relative;
        }

        .modal-overlay.active {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-overlay.active .modal {
            transform: scale(1) translateY(0);
        }

        input {
            width: 92%;
            padding: 10px;
            margin: 12px 0;
        }

        .subscribe-btn {
            width: 100%;
            padding: 10px;
            background: #c55f17db;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .close-btn {
            position: absolute;
            top: 8px;
            right: 12px;
            background: none;
            border: none;
            font-size: 22px;
            cursor: pointer;
        }
        /***************************
            FOOTER
        ***************************/
        footer {
            text-align: center;
            padding: 30px;
            margin-top: 40px;
            background: var(--card-bg);
            border-top: 1px solid var(--border-color);
        }
        
        /* ==========================
        MOBILE FIRST FIXES
        ========================== */

        /* Prevent horizontal scroll */
        @media (max-width: 768px) {
            html, body {
                max-width: 100%;
                overflow-x: hidden;
            }
        
            /* Header */
            .dm-header {
                padding: 12px 10px;
                position: sticky;
            }
            .dm-title {
                font-size: 1.05rem;
                text-align: center;
            }
        }

        /* HERO */
        @media (max-width: 768px) {
            .hero {
                padding: 0px;
            }
            .carousel {
                width: auto;
            }
            .carousel-slide img {
                height: 220px;
            }
            .carousel-caption {
                font-size: 0.75rem;
                text-align: center;
                position: absolute;
                bottom: 20px;
                left: 15px;
                right: 15px;
                color: #fff;
                background: rgba(0,0,0,0.5);
                padding: 10px 14px;
                border-radius: 8px;
            }
        }
        /* Section titles */
        .section-title {
            font-size: 1.25rem;
            margin: 22px auto 8px;
        }
        /* ==========================
        TOPICS → SCROLLABLE CHIPS
        ========================== */
        @media (max-width: 768px) {
            .topics {
                gap: 10px;
                flex-wrap: wrap;
            }

            .topics::-webkit-scrollbar {
                display: none;
            }

            .topic-card {
                flex: 0 0 auto;
                min-width: 69px;
                text-align: center;
                padding: 12px;
                font-size: 0.55rem;
            }
        }
        /* ==========================
        CARDS
        ========================== */
        @media (max-width: 768px) {
            .card-container {
                padding: 0 10px;
            }

            .card {
                flex: 0 0 91%;
            }

            .card img {
                height: 160px;
                object-fit: cover;
            }
        }  
        
        /* ==========================
        TRENDING
        ========================== */
        @media (max-width: 768px) {
            .trend-card {
                padding: 10px;
            }
        }

        /* ==========================
        COMMUNITY
        ========================== */
        @media (max-width: 768px) {
            .community {
                padding: 0 10px;
            }
            .quick-links {
                gap: 8px;
            }

            .quick-btn {
                font-size: 0.9rem;
                padding: 10px 12px;
            }
        }
        @media (max-width: 768px) {
            .copied-label {
                top:50px;
                left:15%;
            }
        }
        /* ==========================
        TABLET & UP
        ========================== */
        @media (min-width: 768px) {
            .carousel-slide img {
                height: 240px;
            }

            .topic-card {
                min-width: unset;
            }
        }
            .card-viewport {
    overflow: hidden;
    width: 100%;
}

.card-track {
    display: flex;
   will-change: transform;
}

.card {
    min-width: 300px;   /* adjust to your card width */
    margin-right: 16px;
    cursor: pointer;
}
    </style>
</head>

<body>

    <!-- ⭐ HEADER SECTION -->
    <header class="dm-header">
        <!-- Logo + Title -->
        <div class="dm-brand">
            <img src="dailyMicon.png" class="dm-logo" alt="DailyMuse Logo" />
            <h3 class="dm-title">India's headlines, from the finest five</h3>
        </div>
        <!-- ⭐ Topics -->
        <section class="topics">
            <a href="#india" class="topic-card">🪷 India</a>
            <a href="#finance" class="topic-card">💰 Finance</a>
            <a href="#technology" class="topic-card">🌍 Technology</a>
            <a href="#sports" class="topic-card">⚽ Sports</a>
            <a href="#entertainment" class="topic-card">🎬 Entertainment</a>
            <a href="#health" class="topic-card">🩺 Health</a>
        </section>
    </header>
    
    <!-- ⭐ HERO SECTION -->
    <section class="hero">
       <h2 class="section-title">Latest news</h2>
        <div class="carousel">
            ${params.map((entry, index) => `
                <div class="carousel-slide${index === 0 ? ' active' : ''}">
                    <div class="card-viewport">
                        <div class="card-track">
                            ${entry.headlines
                            .map((c) => {
                                const img =
                                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                                    c?.enclosure?.["$"]?.url ||
                                    c?.StoryImage ||
                                    c?.mediaContent?.["$"]?.url ||
                                    "noImg.png";
                                return `
                                        <div class="card" onclick="handleSlideClick('${c?.link || '#'}')">
                                            <img src="${img}" width="100%" height="180"> 
                                            <div class="carousel-caption">
                                                <span class="headline-title">
                                                    ${c.title || "Top Stories Curated for You"}
                                                </span>
                                                <span>
                                                    <b><i>- ${entry.link === 'https://www.thehindu.com/news/national/' ? 'The Hindu' : entry.link === 'https://www.cnbctv18.com/business/' ?'CNBCTV18' : entry.title}</i></b>
                                                </span>
                                            </div>
                                        </div>
                                    `;
                            }).join("")}
                        </div>
                    </div>
                                </div>
                            `).join('')}
                        </div>
</section>
<!-- ⭐ Trending Section -->
    <h2 class="section-title">Trending Now <span style="color: #c55f17db;font-size: 0.85rem;">AI Analysis</span></h2>
    <section class="trending">
         ${topic.map(({topic})=>{
           return `<div class="trend-card">
                <div class="heat heat-1"></div>
                <div class="card-header">
                    <h3>${topic.title || "Trending Topic"}</h3>
                    <button class="expand-btn" aria-label="Expand">
                        ▼
                    </button>
                </div>
                <div class="card-content">
                    <p>
                        ${topic.contentSnippet || "Stay informed with Daily Muse's AI-curated trending topics, bringing you the latest news highlights at your fingertips."}
                    </p>
                    <span>${topic.pubDate}</span>
                </div>
            </div> 
            `}).join("")}
    </section>
    <!-- ⭐ Dynamic News -->
    <section>
        <h2 class="section-title">From Your Favorite Sources</h2>
        ${params
            .map(
                (entry) => `
            <div class="news-header">
                <img src="${entry?.image === 'https://www.cnbctv18.com/_next/static/media/cnbctv18-logo.e3f586f6.png'
                        ? 'CNBC_TV18.png'
                        : entry?.image}" width="100" height="90" style="object-fit: contain; border-radius: 8px;"/>
                <div>
                    <h3 style="margin-block-end: 0.5rem;"><a href="${entry.link}" target="_blank" style="color: #8a1260db;text-decoration: none;">${entry.title}</a></h3>
                    <p style="color: #c55f17db; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600;margin-block-start: 0.5rem;">${entry.pubDate}</p>
                </div>
            </div>
            <div class="card-container">
                ${entry.headlines
                        .map((c) => {
                            const img =
                                c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                                c?.enclosure?.["$"]?.url ||
                                c?.StoryImage ||
                                c?.mediaContent?.["$"]?.url ||
                                "noImg.png";
                            return `
                        <div class="card">
                            <img src="${img}" width="100%" height="180">
                            <h3 style="margin-block-start: 0px;padding:15px;">${c.title}</h3>
                        </div>
                    `;
                        }).join("")}
            </div>
        `
            ).join("")}
    </section>

    
    
    <!-- ⭐ Topic News -->
    <section>
        <h2 class="section-title">Explore by Topics</h2>
        <h5 class="topic-header">India</h5>
        <div class="category-topics" id="india">
            ${params
            .flatMap(entry => entry.headlines)
            .filter(c =>
                c.link.toLowerCase().includes('/india') ||
                c.link.toLowerCase().includes('national')
            )
            .map(c => {
                const img =
                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                    c?.enclosure?.["$"]?.url ||
                    c?.StoryImage ||
                    c?.mediaContent?.["$"]?.url ||
                    "noImg.png";
                return `
                    <div class="category-topic-card" onclick="window.open('${c.link}', '_blank')">
                        <img src="${img}" width="100%" height="180">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;overflow: hidden; text-overflow: ellipsis;">${c.title}</h3>
                    </div>
                `})
            .join('')}
        </div>
        ${params.flatMap(item => item.headlines).find(topicUrl => topicUrl.link.toLowerCase().includes('finance') || topicUrl.link.toLowerCase().includes('stocks') || topicUrl.link.toLowerCase().includes('market') || topicUrl.link.toLowerCase().includes('business') || topicUrl.link.toLowerCase().includes('ecomnomy')) ? `<h5 class="topic-header">Finance</h5>` : ''}
        <div class="category-topics" id="finance">
            ${params
            .flatMap(entry => entry.headlines)
            .filter(c =>
                c.link.toLowerCase().includes('finance') ||
                c.link.toLowerCase().includes('/finance') ||
                c.link.toLowerCase().includes('stocks') ||
                c.link.toLowerCase().includes('market') ||
                c.link.toLowerCase().includes('tariff') ||
                c.link.toLowerCase().includes('business') ||
                c.link.toLowerCase().includes('banks') ||
                c.link.toLowerCase().includes('economy')
            )
            .map(c => {
                const img =
                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                    c?.enclosure?.["$"]?.url ||
                    c?.StoryImage ||
                    c?.mediaContent?.["$"]?.url ||
                    "noImg.png";
                return `
                    <div class="category-topic-card" onclick="window.open('${c.link}', '_blank')">
                        <img src="${img}" width="100%" height="180">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;overflow: hidden; text-overflow: ellipsis;">${c.title}</h3>
                    </div>
                `})
            .join('')}
        </div>   
        ${params.flatMap(item => item.headlines).find(topicUrl => topicUrl.link.toLowerCase().includes('technology')) ? `<h5 class="topic-header">Technology</h5>` : ''}
        <div class="category-topics" id="technology">
            ${params
            .flatMap(entry => entry.headlines)
            .filter(c =>
                c.link.toLowerCase().includes('technology') ||
                c.link.toLowerCase().includes('/technology') ||
                c.link.toLowerCase().includes('tech') ||
                c.link.toLowerCase().includes('gadgets')
            )
            .map(c => {
                const img =
                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                    c?.enclosure?.["$"]?.url ||
                    c?.StoryImage ||
                    c?.mediaContent?.["$"]?.url ||
                    "noImg.png";
                return `
                    <div class="category-topic-card" onclick="window.open('${c.link}', '_blank')">
                        <img src="${img}" width="100%" height="180">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;overflow: hidden; text-overflow: ellipsis;">${c.title}</h3>
                    </div>
                `})
            .join('')}   
        </div>
        ${params.flatMap(item => item.headlines).find(topicUrl => topicUrl.link.toLowerCase().includes('sports')) ? `<h5 class="topic-header">Sports</h5>` : ''}
        <div class="category-topics" id="sports">
            ${params
            .flatMap(entry => entry.headlines)
            .filter(c =>
                c.link.toLowerCase().includes('sports') ||
                c.link.toLowerCase().includes('/sports') ||
                c.link.toLowerCase().includes('boxing') ||
                c.link.toLowerCase().includes('cricket') ||
                c.link.toLowerCase().includes('football') ||
                c.link.toLowerCase().includes('soccer') ||
                c.link.toLowerCase().includes('tennis') ||
                c.link.toLowerCase().includes('hockey') ||
                c.link.toLowerCase().includes('badminton') ||
                c.link.toLowerCase().includes('kabaddi') ||
                c.link.toLowerCase().includes('championships') ||
                c.link.toLowerCase().includes('champions')
            )
            .map(c => {
                const img =
                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                    c?.enclosure?.["$"]?.url ||
                    c?.StoryImage ||
                    c?.mediaContent?.["$"]?.url ||
                    "noImg.png";
                return `
                    <div class="category-topic-card" onclick="window.open('${c.link}', '_blank')">
                        <img src="${img}" width="100%" height="180">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;overflow: hidden; text-overflow: ellipsis;">${c.title}</h3>
                    </div>
                `})
            .join('')}
        </div>
        ${params.flatMap(item => item.headlines).find(topicUrl => topicUrl.link.toLowerCase().includes('entertainment')) ? `<h5 class="topic-header">Entertainment</h5>` : ''}
        <div class="category-topics" id="entertainment">
            ${params
            .flatMap(entry => entry.headlines)
            .filter(c =>
                c.link.toLowerCase().includes('entertainment') ||
                c.link.toLowerCase().includes('/entertainment')
            )
            .map(c => {
                const img =
                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                    c?.enclosure?.["$"]?.url ||
                    c?.StoryImage ||
                    c?.mediaContent?.["$"]?.url ||
                    "noImg.png";
                return `
                    <div class="category-topic-card" onclick="window.open('${c.link}', '_blank')">
                        <img src="${img}" width="100%" height="180">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;overflow: hidden; text-overflow: ellipsis;">${c.title}</h3>
                    </div>
                `})
            .join('')}    
        </div>
       ${params.flatMap(item => item.headlines).find(topicUrl => topicUrl.link.toLowerCase().includes('health')) ? `<h5 class="topic-header">Health</h5>` : ''}
        <div class="category-topics" id="health">
           ${params
            .flatMap(entry => entry.headlines)
            .filter(c =>
                c.link.toLowerCase().includes('health') ||
                c.link.toLowerCase().includes('/health')
            )
            .map(c => {
                const img =
                    c?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] ||
                    c?.enclosure?.["$"]?.url ||
                    c?.StoryImage ||
                    c?.mediaContent?.["$"]?.url ||
                    "noImg.png";
                return `
                    <div class="category-topic-card" onclick="window.open('${c.link}', '_blank')">
                        <img src="${img}" width="100%" height="180">
                        <h3 style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;overflow: hidden; text-overflow: ellipsis;">${c.title}</h3>
                    </div>
                `})
            .join('')}   
        </div>
    </section>
    <!-- ⭐ Community -->
    <h2 class="section-title">Community & Shareability</h2>
    <section class="community">
        <div class="quick-links">
            <div class="quick-btn" onClick="copyLink(event,'https://paul41.github.io/DailyMuse/')">Share DailyMuse
                <span class="copied-label">Copied!</span>
            </div>
            <div class="quick-btn" onClick="subscribeModal()">Subscribe</div>
            <div class="quick-btn">Blog</div>
        </div>
    </section>

    <!-- ⭐ Subscribe Modal -->
    <div class="modal-overlay" id="subscribeModal">
        <div class="modal">
            <button class="close-btn" onclick="closeModal()">&times;</button>
            <h2>Subscribe to DailyMuse</h2>
            <p>Get daily updates straight to your inbox.</p>
            <input type="email" id="emailInput" placeholder="Enter your email" />
            <button class="subscribe-btn" onclick="submitSubscription()">Subscribe</button>
        </div>
    </div>

    <!-- ⭐ Footer -->
    <footer>
        <div style="margin-block-end: 1em;">
            <a href="privacy.html" target="_blank" style="color: #8a1260db;text-decoration: none;font-size: 0.85rem">Privacy Policy</a> | 
            <a href="about.html" target="_blank" style="color: #8a1260db;text-decoration: none;font-size: 0.85rem">About us</a>
        </div>
        <b>DailyMuse · One brilliant headliner, delivered daily</b>
        <p style="margin-block-start: 0">© 2026 DailyMuse</p>
    </footer>

    <!-- ⭐ GSAP -->
    <script>
        gsap.registerPlugin(ScrollTrigger);

        gsap.from(".dm-header", { y: -40, opacity: 0, duration: 1 });

        gsap.from(".carousel", { y: 40, opacity: 0, duration: 1.2 });

        gsap.from(".trend-card", {
            scrollTrigger: { trigger: ".trending", start: "top 80%" },
            opacity: 0, y: 30, stagger: 0.15
        });

        gsap.from(".topic-card", {
            scrollTrigger: { trigger: ".topics", start: "top 80%" },
            opacity: 0, scale: 0.7, stagger: 0.1
        });

        // carousel auto slide
        // const slides = document.querySelectorAll(".carousel-slide");
        // let i = 0;
        // setInterval(() => {
        //     slides[i].classList.remove("active");
        //     i = (i + 1) % slides.length;
        //     slides[i].classList.add("active");
        // }, 4500);
        function handleSlideClick(link) { 
            // open in new tab 
            window.open(link, "_blank");
        }
document.querySelectorAll(".carousel-slide").forEach(slide => {
    const track = slide.querySelector(".card-track");
    const cards = Array.from(track.children);

    const cardWidth = cards[0].offsetWidth + 16;
    const visibleCards = Math.floor(slide.offsetWidth / cardWidth);

    // clone first visible cards
    for (let i = 0; i < visibleCards; i++) {
        track.appendChild(cards[i].cloneNode(true));
    }

    let index = 0;
    let transitioning = false;

    function move() {
        if (transitioning) return;
        transitioning = true;

        index++;
        track.style.transition = "transform 0.6s ease-in-out";
        track.style.transform = 'translateX(-' + (index * cardWidth) + 'px)';
    }

    track.addEventListener("transitionend", () => {
        if (index >= cards.length) {
            track.style.transition = "none";
            index = 0;
            track.style.transform = "translateX(0px)";
        }
        transitioning = false;
    });

    setInterval(move, 3700);
});


        function copyLink(event, link) {
            event.preventDefault();
            navigator.clipboard.writeText(link).then(() => {
                const el = event.target;
                console.log('Link copied to clipboard:', event);
                el.classList.add("show");
                setTimeout(() => {
                    el.classList.remove("show");
                }, 1200);
            })
            .catch(err => { console.error('Failed to copy: ', err); });
        }
        function subscribeModal() {
            document.getElementById("subscribeModal").classList.add("active");
        }

        function closeModal() {
            document.getElementById("subscribeModal").classList.remove("active");
        }

        function submitSubscription() {
            const email = document.getElementById("emailInput").value;

            if (!email) {
                alert("Please enter a valid email address.");
                return;
            }

            alert("Thank you for subscribing, " + email + "!");
            closeModal();
        }

        /* Close modal when clicking outside */
        document.getElementById("subscribeModal").addEventListener("click", function (e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Expandable trending cards
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.trend-card').classList.toggle('expanded');
            });
        });

    </script>

</body>
</html>`;

    fs.writeFileSync("index.html", html);
}


