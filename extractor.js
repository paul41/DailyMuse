const xml2js  = require('xml2js');
class RSSLinkExtractor{
    constructor(xmlData){
        this.xmlContent = xmlData;
    }
    async extractLinks(){
        const parser = new xml2js.Parser({ explicitArray: false }); // avoids lots of nested arrays
        const channels = [];
        for(const xml of this.xmlContent){
            try {
                const result = await parser.parseStringPromise(xml);
                const channel = result.rss?.channel;
                const items = channel?.item || [];
                const contentArray = items.map(({title,link,enclosure,StoryImage,description,['media:content']: mediaContent})=>({title,link,enclosure,StoryImage,description,mediaContent})).slice(0,10)
                channels.push({
                    title: channel?.title,
                    link: channel?.link,
                    pubDate: channel?.lastBuildDate ? new Date(channel.lastBuildDate).toDateString() : new Date().toDateString(),
                    image: channel?.image?.url || channel?.fullimage || null,
                    headlines: contentArray
                });
            } catch (error) {
                console.error('Error parsing XML:', error);
                return [];
            }
        }
        return channels;
    }
}
module.exports = RSSLinkExtractor;