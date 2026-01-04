const fs = require('fs');
const raw = fs.readFileSync('data.json', 'utf-8');
const RSSLinkExtractor = require('./extractor');
const xmlContent = JSON.parse(raw);


(async () => {
    const extractor = new RSSLinkExtractor(xmlContent);
    const contents = await extractor.extractLinks();
    await updateHTML(contents).then(data => console.log('✅ HTML generated: index.html')).catch(err => {
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
            overflow: hidden;
            border-radius: 14px;
            box-shadow: var(--shadow);
            position: relative;
        }

        .carousel-slide {
            display: none;
        }
        .carousel-slide.active {
            display: block;
        }

        .carousel-slide img {
            width: 100%;
            height: 240px;
            object-fit: cover;
            border-radius: 14px;
        }

        .carousel-caption {
            position: absolute;
            bottom: 20px;
            left: 20px;
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
            padding: 16px;
            border-radius: 14px;
            border-color: var(--border-color);
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
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }

        .quick-btn {
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
            gap: 16px;
            background: var(--card-bg);
            border-radius: 12px;
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
            flex: 0 0 100%;
            background: var(--card-bg);
            border-radius: 14px;
            padding: 16px;
            box-shadow: var(--shadow);
        }

        @media (min-width: 768px) {
            .card { flex: 0 0 50%; }
        }
        @media (min-width: 1200px) {
            .card { flex: 0 0 33%; }
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
    </style>
</head>

<body>

    <!-- ⭐ HEADER SECTION -->
    <header class="dm-header">
        <!-- Logo + Title -->
        <div class="dm-brand">
            <img src="dailyMicon.png" class="dm-logo" alt="DailyMuse Logo" />
            <h3 class="dm-title">India's headlines,from the finest five</h3>
        </div>
        <!-- ⭐ Topics -->
        <section class="topics">
            <div class="topic-card">🪷 India</div>
            <div class="topic-card">💰 Finance</div>
            <div class="topic-card">🌍 Technology</div>
            <div class="topic-card">⚽ Sports</div>
            <div class="topic-card">🎬 Entertainment</div>
            <div class="topic-card">🩺 Health</div>
        </section>
    </header>
    
    <!-- ⭐ HERO SECTION -->
    <section class="hero">
       <h2 class="section-title">Today’s Top Stories</h2>
       <div class="carousel">
            ${params.map((entry, index) => `
                <div class="carousel-slide${index === 0 ? ' active' : ''}">
                    <img src="${entry.headlines[0]?.description?.match(/<img[^>]+src=(["'])(.*?)\1/)?.[2] 
                        || entry.headlines[0]?.enclosure?.["$"]?.url 
                        || entry.headlines[0]?.StoryImage 
                        || entry.headlines[0]?.mediaContent?.["$"]?.url 
                        || "noImg.png"}" />
                    <div class="carousel-caption">
                        ${entry.headlines[0]?.title || "Top Stories Curated for You"}
                    </div>
                </div>
            `).join('')}
        </div>
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
                    <h3><a href="${entry.link}" target="_blank" style="color: #8a1260db;">${entry.title}</a></h3>
                    <p style="color: #c55f17db; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600;">${entry.pubDate}</p>
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
                            <h3>${c.title}</h3>
                            <a href="${c.link}" target="_blank">Read →</a>
                        </div>
                    `;
                            }).join("")}
            </div>
        `
                ).join("")}
    </section>
     <!-- ⭐ Trending Section -->
    <h2 class="section-title">Trending Now</h2>
    <section class="trending">
        <div class="trend-card">
            <div class="heat heat-1"></div>
            <h3>Markets Surge to Record High</h3>
        </div>
        <div class="trend-card">
            <div class="heat heat-2"></div>
            <h3>AI Adoption in India Jumps</h3>
        </div>
        <div class="trend-card">
            <div class="heat heat-3"></div>
            <h3>Monsoon Expected Above Normal</h3>
        </div>
    </section>
    <!-- ⭐ Community -->
    <h2 class="section-title">Community & Shareability</h2>
    <section class="community">
        <div class="quick-links">
            <div class="quick-btn">Share DailyMuse</div>
            <div class="quick-btn">Submit Feedback</div>
            <div class="quick-btn">Subscribe</div>
        </div>

        <div class="digest-cards">
            <div class="digest">Morning Brief</div>
            <div class="digest">Evening Wrap</div>
        </div>
    </section>

    <!-- ⭐ Footer -->
    <footer>
        <b>DailyMuse · One brilliant headliner, delivered daily</b>
        <p>© 2025 DailyMuse</p>
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
        const slides = document.querySelectorAll(".carousel-slide");
        let i = 0;
        setInterval(() => {
            slides[i].classList.remove("active");
            i = (i + 1) % slides.length;
            slides[i].classList.add("active");
        }, 4000);
    </script>

</body>
</html>`;

    fs.writeFileSync("index.html", html);
}


