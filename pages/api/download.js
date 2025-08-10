import { exec } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { url, format } = req.body;
  if (!url || !format) {
    return res.status(400).json({ error: 'URL and format are required' });
  }

  // Define the path to the bundled yt-dlp binary
  const ytdlpPath = path.join(process.cwd(), 'bin', 'yt-dlp');

  // Ensure the binary is executable
  exec(`chmod +x ${ytdlpPath}`);

  const tmpDir = path.join('/tmp');
  const filename = `output-${Date.now()}`;
  let cmd = '';

  try {
    if (format === 'mp3') {
      cmd = `${ytdlpPath} -x --audio-format mp3 --audio-quality 0 -o "${path.join(tmpDir, filename)}.mp3" "${url}"`;
    } else { // mp4
      cmd = `${ytdlpPath} -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${path.join(tmpDir, filename)}.mp4" "${url}"`;
    }

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Download error:', error);
        return res.status(500).json({ error: `Download failed: ${error.message}` });
      }

      const filePath = `${path.join(tmpDir, filename)}.${format}`;
      res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename=${path.basename(filePath)}`);
      res.sendFile(filePath);
    });

  } catch (e) {
    console.error('Error in handler:', e);
    return res.status(500).json({ error: 'Server error' });
  }
}
