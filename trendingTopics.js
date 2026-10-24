/* ================== DEPENDENCIES ================== */

const fs = require('fs');
const natural = require('natural');
const stemmer = natural.PorterStemmer;
const stopword = require('stopword');
const Parser = require('rss-parser'); // uncomment when ready
const { log } = require('console');
const parser = new Parser();
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

/* ================== CONFIG ================== */

const FEEDS = [
 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
  'https://feeds.feedburner.com/NDTV-LatestNews',
  'https://www.indiatoday.in/rss/1206578',
  'https://www.thehindu.com/news/national/?service=rss',
  'https://www.cnbctv18.com/commonfeeds/v1/cne/rss/business.xml'
];

const SIMILARITY_THRESHOLD = 0.3;   // clustering threshold
const DEDUP_THRESHOLD = 0.85;       // near-duplicate removal
const TOPICS_TO_RETURN = 7;

/* ================== TEXT PROCESSING ================== */

function preprocess(text = '') {
  return stopword
    .removeStopwords(
      tokenizer
        .tokenize(text.toLowerCase())
        .map(w => w.replace(/[^a-z]/g, ''))
        .filter(w => w.length > 3)
        .map(w => stemmer.stem(w))
    )
    .join(' ');
}

/* ================== VECTOR UTILS ================== */

function vectorize(tfidf, index) {
  const vec = {};
  tfidf.listTerms(index).forEach(t => {
    vec[t.term] = t.tfidf;
  });
  return vec;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;

  for (const k in a) {
    dot += (a[k] || 0) * (b[k] || 0);
    magA += a[k] * a[k];
  }

  for (const k in b) {
    magB += b[k] * b[k];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

function addVectors(a, b) {
  const out = { ...a };
  for (const k in b) {
    out[k] = (out[k] || 0) + b[k];
  }
  return out;
}

function scaleVector(v, s) {
  const out = {};
  for (const k in v) out[k] = v[k] / s;
  return out;
}

/* ================== DEDUPLICATION ================== */

function deduplicateArticles(vectors, articles) {
  const keep = [];
  const removed = new Set();

  vectors.forEach((vec, i) => {
    if (removed.has(i)) return;

    keep.push(i);

    for (let j = i + 1; j < vectors.length; j++) {
      if (removed.has(j)) continue;
      if (cosineSimilarity(vec, vectors[j]) >= DEDUP_THRESHOLD) {
        removed.add(j);
      }
    }
  });

  return keep.map(i => ({
    article: articles[i],
    vector: vectors[i]
  }));
}

/* ================== CLUSTERING ================== */

function clusterDocuments(items) {
  const clusters = [];

  items.forEach(({ vector, article }) => {
    let bestCluster = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const sim = cosineSimilarity(vector, cluster.centroid);
      if (sim > bestScore) {
        bestScore = sim;
        bestCluster = cluster;
      }
    }

    if (bestCluster && bestScore >= SIMILARITY_THRESHOLD) {
      bestCluster.docs.push(article);
      bestCluster.feeds.add(article.feed);
      bestCluster.sumVector = addVectors(bestCluster.sumVector, vector);
      bestCluster.centroid = scaleVector(
        bestCluster.sumVector,
        bestCluster.docs.length
      );
    } else {
      clusters.push({
        docs: [article],
        feeds: new Set([article.feed]),
        sumVector: vector,
        centroid: vector
      });
    }
  });

  return clusters;
}

/* ================== TOPIC LABELING ================== */

function extractTopic(tfidf, docs) {
  const scores = {};

  docs.forEach(d => {
    // console.log(d)
    tfidf.listTerms(d._tfidfIndex)
      .slice(0, 7)
      .forEach(t => {
        scores[t.term] = (scores[t.term] || 0) + t.tfidf;
        scores["title"] = d.title;
        scores["contentSnippet"] = d.contentSnippet;
        scores["pubDate"] = d.pubDate;
        // scores["img"] = d.img;
        scores["link"] = d.link;
      });
  });
  return scores;
}

/* ================== MAIN PIPELINE ================== */

async function findTrendingTopics() {
  const articles = [];

  for (const feedUrl of FEEDS) {
    // console.log(`Fetching feed: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl);
    feed.items.forEach(item => {
      articles.push({
        title: item.title || '',
        content: preprocess(
          `${item.title || ''} ${item.contentSnippet || item.content || ''}`
        ),
        feed: feed.title || feedUrl,
        pubDate: item.pubDate || '',
        contentSnippet: item.contentSnippet || '',
        // img: item,
        link: item.link || ''
      });
    });
  }

  const tfidf = new TfIdf();
  articles.forEach(a => tfidf.addDocument(a.content));
  articles.forEach((a, i) => (a._tfidfIndex = i));
  const vectors = articles.map((_, i) => vectorize(tfidf, i));
  const uniqueItems = deduplicateArticles(vectors, articles);
  const clusters = clusterDocuments(uniqueItems);
  // console.log(clusters);
  
  return clusters
    .map(c => ({
      topic: extractTopic(tfidf, c.docs),
      articleCount: c.docs.length,
      feedCount: c.feeds.size,
      score: c.docs.length * Math.log(1 + c.feeds.size)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOPICS_TO_RETURN);
}

/* ================== RUN ================== */

// findTrendingTopics()
//   .then(topics => {
//     console.log('\n🔥 Trending Topics:\n');
//     topics.forEach((t, i) => {
//       console.log(
//         `${i + 1}. ${t.topic.title} (${t.articleCount} articles, ${t.feedCount} feeds)`
//       );
//       //return `${t.topic.title}`
//     });
//   })
//   .catch(console.error);
module.exports = {findTrendingTopics};