/**
 * Universal Video URL parser for YouTube, Google Drive, and direct video links.
 * Converts share URLs to embeddable player URLs.
 */
export function formatVideoEmbedUrl(url: string | null | undefined): {
  embedUrl: string;
  platform: 'youtube' | 'drive' | 'direct' | 'unknown';
  detectedName: string;
} {
  if (!url || !url.trim()) {
    return { embedUrl: '', platform: 'unknown', detectedName: '' };
  }

  const cleanUrl = url.trim();

  // 1. Google Drive
  // Formats:
  // - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
  // - https://drive.google.com/file/d/{FILE_ID}/preview
  // - https://drive.google.com/open?id={FILE_ID}
  // - https://drive.google.com/uc?id={FILE_ID}
  if (cleanUrl.includes('drive.google.com')) {
    const fileIdMatch =
      cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      return {
        embedUrl: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`,
        platform: 'drive',
        detectedName: 'Google Drive Video',
      };
    }
    if (cleanUrl.includes('/preview')) {
      return { embedUrl: cleanUrl, platform: 'drive', detectedName: 'Google Drive Video' };
    }
    return { embedUrl: cleanUrl, platform: 'drive', detectedName: 'Google Drive' };
  }

  // 2. YouTube
  // Formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    let videoId = '';
    if (cleanUrl.includes('youtu.be/')) {
      videoId = cleanUrl.split('youtu.be/')[1]?.split(/[?&]/)[0] || '';
    } else if (cleanUrl.includes('/shorts/')) {
      videoId = cleanUrl.split('/shorts/')[1]?.split(/[?&]/)[0] || '';
    } else if (cleanUrl.includes('/embed/')) {
      return { embedUrl: cleanUrl, platform: 'youtube', detectedName: 'YouTube' };
    } else if (cleanUrl.includes('v=')) {
      videoId = cleanUrl.split('v=')[1]?.split('&')[0] || '';
    }

    if (videoId) {
      return {
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
        platform: 'youtube',
        detectedName: 'YouTube Video',
      };
    }
  }

  // 3. Direct video (MP4, WebM) or other embed
  return { embedUrl: cleanUrl, platform: 'direct', detectedName: 'Direct Video URL' };
}
