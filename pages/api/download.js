import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

export const config = {
  api: {
    responseLimit: false,
  },
};

// This function handles the API request for downloading the video or audio.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url, format, quality } = req.body;

  if (!url || !format) {
    res.status(400).json({ error: 'Missing url or format' });
    return;
  }

  const tempDir = path.resolve('./tmp');
  const fileName = `output-${Date.now()}.${format}`;
  const outputFile = path.join(tempDir, fileName);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  let cmd = '';

  // Use the system-wide command
  const ytdlpPath = 'yt-dlp';

  if (format === 'mp4') {
    const qualityFilter = quality ? `[height=${quality.replace('p','')}]` : '';
    cmd = `${ytdlpPath} -f "bestvideo[ext=mp4]${qualityFilter}+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${outputFile}" "${url}"`;
  } else if (format === 'mp3') {
    cmd = `${ytdlpPath} -x --audio-format mp3 --audio-quality 0 -o "${outputFile}" "${url}"`;
  } else {
    res.status(400).json({ error: 'Unsupported format' });
    return;
  }

  try {
    const { stdout, stderr } = await execPromise(cmd, { maxBuffer: 1024 * 1024 * 5 });

    if (!fs.existsSync(outputFile)) {
      throw new Error(`Failed to create output file: ${outputFile}`);
    }

    const stat = fs.statSync(outputFile);
    res.setHeader('Content-Type', format === 'mp4' ? 'video/mp4' : 'audio/mp3');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = fs.createReadStream(outputFile);
    fileStream.pipe(res);

    fileStream.on('close', () => {
      fs.unlink(outputFile, (err) => {
        if (err) console.error('Failed to delete temporary file:', err);
      });
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download the video or audio.' });

    if (fs.existsSync(outputFile)) {
      fs.unlink(outputFile, (err) => {
        if (err) console.error('Failed to delete temporary file on error:', err);
      });
    }
  }
}
