import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  async function handleDownload() {
    setError('');
    setDownloadUrl('');
    if (!url) {
      setError('Please enter a video URL');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Download failed');
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      setDownloadUrl(href);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    // The main container is now a flexbox that centers its content both horizontally and vertically
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* This inner div acts as the content box */}
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">YouTube Video Downloader</h1>

        <input
          type="text"
          placeholder="Enter video URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 border border-gray-400 rounded mb-4"
        />

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full p-2 border border-gray-400 rounded mb-4"
        >
          <option value="mp4">MP4 (Video)</option>
          <option value="mp3">MP3 (Audio)</option>
        </select>

        <button
          onClick={handleDownload}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Downloading...' : 'Download'}
        </button>

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        
        {downloadUrl && (
          <div className="mt-4 text-center">
            <a
              href={downloadUrl}
              download={`youtube-download-${Date.now()}.${format}`}
              className="text-blue-600 hover:underline"
            >
              Click to download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
