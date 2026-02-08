const natural = require('natural');
const stopword = require('stopword');
const TfIdf = natural.TfIdf;
const raw = fs.readFileSync('data.json', 'utf-8');

const SIMILARITY_THRESHOLD = 0.25;
const TOPICS_TO_RETURN = 5;

/* ------------------ TEXT PROCESSING ------------------ */

function preprocess(text = '') {
  return stopword.removeStopwords(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
  ).join(' ');
}

/* ------------------ COSINE SIMILARITY ------------------ */

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

/* ------------------ CLUSTERING ------------------ */

function clusterDocuments(vectors, articles) {
  const clusters = [];

  vectors.forEach((vec, i) => {
    let added = false;

    for (const cluster of clusters) {
      const similarity = cosineSimilarity(vec, cluster.centroid);
      if (similarity >= SIMILARITY_THRESHOLD) {
        cluster.docs.push(i);
        cluster.feeds.add(articles[i].feed);
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push({
        docs: [i],
        centroid: vec,
        feeds: new Set([articles[i].feed])
      });
    }
  });

  return clusters;
}

/* ------------------ TOPIC LABELING ------------------ */

function extractTopic(tfidf, docIndexes) {
  const scores = {};

  docIndexes.forEach(i => {
    tfidf.listTerms(i).slice(0, 5).forEach(t => {
      scores[t.term] = (scores[t.term] || 0) + t.tfidf;
    });
  });

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(t => t[0])
    .join(' ');
}

/* ------------------ MAIN PIPELINE ------------------ */

async function findTrendingTopics() {
  const articles = [];

  for (const feedUrl of FEEDS) {
    //const feed = await parser.parseURL(feedUrl); // TODO: Implement feed fetching
    // feed.items.forEach(item => {
    //   articles.push({
    //     title: item.title,
    //     content: preprocess(`${item.title} ${item.contentSnippet || ''}`),
    //     feed: feed.title
    //   });
    // });
  }

  const tfidf = new TfIdf();
  articles.forEach(a => tfidf.addDocument(a.content));

  const vectors = articles.map((_, i) => vectorize(tfidf, i));

  const clusters = clusterDocuments(vectors, articles);

  const ranked = clusters
    .map(cluster => ({
      topic: extractTopic(tfidf, cluster.docs),
      articleCount: cluster.docs.length,
      feedCount: cluster.feeds.size
    }))
    .sort((a, b) =>
      b.articleCount * b.feedCount - a.articleCount * a.feedCount
    )
    .slice(0, TOPICS_TO_RETURN);

  return ranked;
}

/* ------------------ RUN ------------------ */

findTrendingTopics()
  .then(topics => {
    console.log('\n🔥 Trending Topics:\n');
    topics.forEach((t, i) => {
      console.log(
        `${i + 1}. ${t.topic} (${t.articleCount} articles, ${t.feedCount} feeds)`
      );
    });
  }).catch(console.error);