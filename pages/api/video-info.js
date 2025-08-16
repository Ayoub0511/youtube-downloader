import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

// This API endpoint fetches basic information about a YouTube video.
export default async function handler(req, res) {
  // Only allow GET requests for fetching video info
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url } = req.query;

  if (!url) {
    res.status(400).json({ error: 'Missing video URL' });
    return;
  }

  // yt-dlp command to get video title and thumbnail
  // -e: get the video title
  // --get-thumbnail: get the thumbnail URL
  const ytdlpPath = path.join(__dirname, 'yt-dlp');
  const cmd = `${ytdlpPath} --print-json "${url}"`;

  try {
    const { stdout } = await execPromise(cmd, { maxBuffer: 1024 * 1024 });
    const videoInfo = JSON.parse(stdout);
    
    // Extract the necessary information
    const { title, thumbnails } = videoInfo;
    const thumbnailUrl = thumbnails[thumbnails.length - 1].url;

    res.status(200).json({ title, thumbnailUrl });
  } catch (error) {
    console.error('Failed to get video info:', error);
    res.status(500).json({ error: 'Failed to retrieve video information.' });
  }
}