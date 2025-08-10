import { useState } from 'react';

// This component represents the main application
export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // Function to handle the download process
  async function handleDownload() {
    setError('');
    setDownloadUrl('');
    if (!url) {
      setError('المرجو إدخال رابط الفيديو');
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
        throw new Error(data.error || 'فشل التنزيل');
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

  // JSX for the component's UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans text-gray-100">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-blue-500 mb-2">
            منزل فيديوهات يوتيوب
          </h1>
          <p className="text-gray-400">
            أسهل طريقة لتنزيل مقاطع الفيديو من يوتيوب إلى MP3 و MP4 مجانًا.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="url-input" className="sr-only">أدخل رابط الفيديو</label>
          <input
            id="url-input"
            type="text"
            placeholder="أدخل رابط الفيديو هنا"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition duration-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => {
              setFormat('mp4');
              handleDownload();
            }}
            disabled={loading}
            className={`w-full p-4 text-lg font-semibold rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${format === 'mp4' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            تنزيل بصيغة MP4
          </button>
          <button
            onClick={() => {
              setFormat('mp3');
              handleDownload();
            }}
            disabled={loading}
            className={`w-full p-4 text-lg font-semibold rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${format === 'mp3' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            تنزيل بصيغة MP3
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center mt-4">
            <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-blue-500">جاري التنزيل، يرجى الانتظار...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-600 text-white rounded-lg text-center">
            <p className="font-semibold">خطأ:</p>
            <p>{error}</p>
          </div>
        )}

        {downloadUrl && (
          <div className="mt-6 text-center">
            <a
              href={downloadUrl}
              download={`youtube_video.${format}`}
              className="inline-block bg-green-500 text-white text-lg font-semibold px-8 py-4 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            >
              تم التنزيل! انقر هنا للحفظ
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
