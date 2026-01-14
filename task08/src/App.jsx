import { useState } from 'react';
import { Cloud, Search, Download, Trash2, Copy, Info, Loader2, AlertCircle } from 'lucide-react';

// Backend API URL
const API_URL = 'http://localhost:3001';

// Comprehensive stop words list
const STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
    'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
    'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
    'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
    'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
    'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
    'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
    'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are',
    'been', 'has', 'had', 'were', 'said', 'did', 'am', 'im', 'ive', 'dont', 'cant', 'wont', 'yeah',
    'oh', 'ooh', 'la', 'na', 'gonna', 'wanna', 'gotta', 'chorus', 'verse', 'bridge', 'intro',
    'outro', 'repeat', 'yeah', 'whoa', 'hey', 'uh', 'ah', 'mmm', 'hmm', 'shes', 'hes', 'theyre',
    'youre', 'were', 'thats', 'whats', 'lets', 'aint', 'isnt', 'wasnt', 'arent', 'werent', 'hasnt',
    'havent', 'hadnt', 'doesnt', 'didnt', 'wouldnt', 'shouldnt', 'couldnt', 'mustnt', 'mightnt',
    'neednt', 'darent', 'oughtnt', 'shant', 'may', 'might', 'must', 'shall', 'should', 'ought'
]);

function App() {
    const [artist, setArtist] = useState('');
    const [song, setSong] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [wordData, setWordData] = useState([]);
    const [showManualInput, setShowManualInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [songInfo, setSongInfo] = useState(null);

    // Fetch lyrics from backend API
    const fetchLyrics = async () => {
        if (!artist.trim() || !song.trim()) {
            setError('Please enter both artist and song name');
            return;
        }

        setLoading(true);
        setError('');
        setLyrics('');
        setWordData([]);

        try {
            const response = await fetch(
                `${API_URL}/api/lyrics?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`
            );

            const data = await response.json();

            if (!data.success) {
                setError(data.error || 'Failed to fetch lyrics');
                setLoading(false);
                return;
            }

            // Set lyrics and song info
            setLyrics(data.lyrics);
            setSongInfo({
                artist: data.artist,
                song: data.song,
                url: data.url,
                thumbnail: data.thumbnail
            });

            // Auto-generate word cloud
            setTimeout(() => {
                generateWordCloud(data.lyrics);
                setLoading(false);
            }, 500);

        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to connect to backend server. Make sure it\'s running on port 3001.');
            setLoading(false);
        }
    };

    // Generate word cloud from text
    const generateWordCloud = (text) => {
        if (!text.trim()) return;

        // Process text
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length >= 3 && !STOP_WORDS.has(word));

        // Count frequency
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Get top 50 words
        const sortedWords = Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50);

        if (sortedWords.length === 0) {
            alert('No meaningful words found. Please paste more lyrics.');
            return;
        }

        // Calculate min and max frequency
        const frequencies = sortedWords.map(([, freq]) => freq);
        const minFreq = Math.min(...frequencies);
        const maxFreq = Math.max(...frequencies);

        // Generate word data with styling
        const data = sortedWords.map(([word, freq]) => {
            // Calculate size (14-54px)
            const normalizedSize = maxFreq === minFreq
                ? 34
                : ((freq - minFreq) / (maxFreq - minFreq)) * 40 + 14;

            return {
                word,
                freq,
                size: normalizedSize,
                x: Math.random() * 80 + 10, // 10-90%
                y: Math.random() * 80 + 10, // 10-90%
                rotation: Math.random() < 0.3 ? -45 : 0, // 30% chance of rotation
                color: `hsl(${Math.random() * 360}, 70%, 50%)` // Random hue
            };
        });

        setWordData(data);
    };

    // Handle manual generate
    const handleManualGenerate = () => {
        if (!lyrics.trim()) {
            alert('Please paste some lyrics first!');
            return;
        }
        generateWordCloud(lyrics);
    };

    // Paste from clipboard
    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setLyrics(text);
        } catch (err) {
            alert('Unable to access clipboard. Please paste manually using Ctrl+V.');
        }
    };

    // Download word cloud as PNG
    const downloadWordCloud = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw words
        wordData.forEach(word => {
            const x = (word.x / 100) * canvas.width;
            const y = (word.y / 100) * canvas.height;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((word.rotation * Math.PI) / 180);

            ctx.font = `bold ${word.size * 2}px Arial`;
            ctx.fillStyle = word.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fillText(word.word, 0, 0);
            ctx.restore();
        });

        // Download
        const filename = artist && song
            ? `${artist.replace(/\s+/g, '-')}-${song.replace(/\s+/g, '-')}-wordcloud.png`
            : 'song-wordcloud.png';

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    // Clear all
    const clearAll = () => {
        setArtist('');
        setSong('');
        setLyrics('');
        setWordData([]);
        setError('');
        setLoading(false);
        setSongInfo(null);
        setShowManualInput(false);
    };

    // Get search URLs
    const getGeniusUrl = () => {
        const query = `${song} ${artist}`.trim();
        return `https://genius.com/search?q=${encodeURIComponent(query)}`;
    };

    const getGoogleUrl = () => {
        const query = `${song} ${artist} lyrics`.trim();
        return `https://google.com/search?q=${encodeURIComponent(query)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Cloud className="w-12 h-12 text-purple-400" />
                        <h1 className="text-5xl font-bold text-white">Lyrics Word Cloud Generator</h1>
                    </div>
                    <p className="text-purple-200 text-lg">Visualize song lyrics as beautiful word clouds</p>
                </div>

                {/* Input Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                    {/* Artist and Song Inputs */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">Artist Name</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                placeholder="e.g., Taylor Swift"
                                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">Song Title</label>
                            <input
                                type="text"
                                value={song}
                                onChange={(e) => setSong(e.target.value)}
                                placeholder="e.g., Shake It Off"
                                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-blue-200 text-sm">
                            <strong>Auto-Scraping Available!</strong> Click "Auto-Fetch Lyrics" to automatically scrape from Genius.com, or search manually and paste lyrics below.
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="text-red-200 text-sm">
                                <strong>Error:</strong> {error}
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                            <div className="text-purple-200 text-sm">
                                Fetching lyrics from Genius.com...
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={fetchLyrics}
                            disabled={loading || !artist.trim() || !song.trim()}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Fetching...
                                </>
                            ) : (
                                <>
                                    <Cloud className="w-4 h-4" />
                                    Auto-Fetch Lyrics
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => window.open(getGeniusUrl(), '_blank')}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Search on Genius
                        </button>
                        <button
                            onClick={() => window.open(getGoogleUrl(), '_blank')}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            Search on Google
                        </button>
                        <button
                            onClick={() => setShowManualInput(true)}
                            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                            Paste Lyrics Here
                        </button>

                        {wordData.length > 0 && (
                            <>
                                <button
                                    onClick={downloadWordCloud}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Word Cloud
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Lyrics Input Section */}
                {showManualInput && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-white">Paste Lyrics</h2>
                            <button
                                onClick={pasteFromClipboard}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                                <Copy className="w-4 h-4" />
                                Paste from Clipboard
                            </button>
                        </div>
                        <textarea
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            placeholder="Paste your song lyrics here..."
                            className="w-full h-64 bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                        />
                        <button
                            onClick={handleManualGenerate}
                            disabled={!lyrics.trim()}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-medium transition-colors text-lg"
                        >
                            <Cloud className="w-5 h-5" />
                            Generate Word Cloud
                        </button>
                    </div>
                )}

                {/* Word Cloud Display */}
                {wordData.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Word Cloud {song && `for "${song}"`} {artist && `by ${artist}`}
                        </h2>
                        <div className="relative bg-slate-900/50 rounded-xl min-h-[500px] overflow-hidden">
                            {wordData.map((word, index) => (
                                <div
                                    key={index}
                                    className="absolute cursor-pointer transition-transform hover:scale-110"
                                    style={{
                                        left: `${word.x}%`,
                                        top: `${word.y}%`,
                                        transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`,
                                        fontSize: `${word.size}px`,
                                        color: word.color,
                                        fontWeight: 'bold',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                    }}
                                    title={`${word.word} appears ${word.freq} times`}
                                >
                                    {word.word}
                                </div>
                            ))}
                        </div>
                        <p className="text-purple-200 text-sm mt-4 text-center">
                            Top 50 words • Hover to see frequency
                        </p>
                    </div>
                )}

                {/* Lyrics Display */}
                {lyrics && wordData.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Lyrics Used</h2>
                        <pre className="bg-slate-900/50 rounded-lg p-4 text-purple-200 text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
                            {lyrics}
                        </pre>
                    </div>
                )}

                {/* How to Use */}
                {!showManualInput && wordData.length === 0 && (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
                        <Cloud className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                        <h2 className="text-3xl font-bold text-white mb-6">How to Use</h2>
                        <div className="space-y-4 text-purple-200 text-lg max-w-2xl mx-auto">
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">1</span>
                                <p className="text-left">Enter the artist name and song title above</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">2</span>
                                <p className="text-left">Click "Search on Genius" or "Search on Google"</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">3</span>
                                <p className="text-left">Copy the song lyrics from the search results</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">4</span>
                                <p className="text-left">Click "Paste Lyrics Here" and paste the lyrics</p>
                            </div>
                            <div className="flex items-start gap-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold">5</span>
                                <p className="text-left">Click "Generate Word Cloud" and enjoy your visualization!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
