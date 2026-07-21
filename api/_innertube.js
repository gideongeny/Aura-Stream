// Shared InnerTube logic for all Vercel serverless functions

const INNERTUBE_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.71 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'X-YouTube-Client-Name': '1',
  'X-YouTube-Client-Version': '2.20260124.00.00',
  'Origin': 'https://www.youtube.com',
  'Referer': 'https://www.youtube.com/',
};

function makeContext() {
  return {
    client: { hl: 'en', gl: 'US', clientName: 'WEB', clientVersion: '2.20260124.00.00' },
  };
}

function getText(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj.simpleText) return obj.simpleText;
  if (obj.runs) return obj.runs.map(r => r.text).join('');
  return '';
}

function getBestThumbnail(thumbnails) {
  if (!thumbnails?.length) return '';
  return thumbnails.reduce((best, t) => (!best || (t.width || 0) > (best.width || 0)) ? t : best, null)?.url || '';
}

function parseDuration(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function parseVideoRenderer(renderer) {
  if (!renderer?.videoId) return null;
  return {
    videoId: renderer.videoId,
    title: getText(renderer.title),
    author: getText(renderer.longBylineText || renderer.shortBylineText || renderer.ownerText),
    viewCount: getText(renderer.viewCountText || renderer.shortViewCountText),
    publishedText: getText(renderer.publishedTimeText),
    thumbnail: getBestThumbnail(renderer.thumbnail?.thumbnails) ||
      `https://img.youtube.com/vi/${renderer.videoId}/hqdefault.jpg`,
    channelThumbnail: getBestThumbnail(renderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails),
    lengthSeconds: parseDuration(getText(renderer.lengthText)),
  };
}

function extractVideosFromSearch(data) {
  const videos = [];
  let continuation = null;
  
  // Normal search results
  let sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
  
  // Continuation results
  if (!sections) {
    const onResponseReceivedCommands = data?.onResponseReceivedCommands || [];
    for (const cmd of onResponseReceivedCommands) {
      if (cmd.appendContinuationItemsAction) {
        sections = cmd.appendContinuationItemsAction.continuationItems;
      }
    }
  }

  if (!sections) return { videos: [], continuation: null };

  for (const section of sections) {
    const items = section?.itemSectionRenderer?.contents || [];
    for (const item of items) {
      const v = parseVideoRenderer(item.videoRenderer);
      if (v) { videos.push(v); continue; }
      const shelfItems = item.shelfRenderer?.content?.verticalListRenderer?.items || [];
      for (const si of shelfItems) {
        const sv = parseVideoRenderer(si.videoRenderer);
        if (sv) videos.push(sv);
      }
    }
    
    // Check for continuation
    if (section.continuationItemRenderer) {
      continuation = section.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
    }
  }
  return { videos, continuation };
}

async function innertubeSearch(query, continuationToken = null) {
  const url = 'https://www.youtube.com/youtubei/v1/search';
  const body = { context: makeContext() };
  
  if (continuationToken) {
    body.continuation = continuationToken;
  } else {
    body.query = query;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: INNERTUBE_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`InnerTube search failed: ${res.status}`);
  const data = await res.json();
  return extractVideosFromSearch(data);
}

module.exports = { innertubeSearch, INNERTUBE_HEADERS, makeContext, getText };
