const { useState } = React;

// Lucide React Icons (simplified inline SVG components)
const CloudIcon = ({ size = 24, className = "" }) => (
    React.createElement('svg', { className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('path', { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" })
    )
);

const SearchIcon = ({ size = 24, className = "" }) => (
    React.createElement('svg', { className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('circle', { cx: "11", cy: "11", r: "8" }),
        React.createElement('path', { d: "m21 21-4.3-4.3" })
    )
);

const DownloadIcon = ({ size = 24, className = "" }) => (
    React.createElement('svg', { className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('path', { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
        React.createElement('polyline', { points: "7 10 12 15 17 10" }),
        React.createElement('line', { x1: "12", x2: "12", y1: "15", y2: "3" })
    )
);

const Trash2Icon = ({ size = 24, className = "" }) => (
    React.createElement('svg', { className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('path', { d: "M3 6h18" }),
        React.createElement('path', { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
        React.createElement('path', { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
        React.createElement('line', { x1: "10", x2: "10", y1: "11", y2: "17" }),
        React.createElement('line', { x1: "14", x2: "14", y1: "11", y2: "17" })
    )
);

const CopyIcon = ({ size = 24, className = "" }) => (
    React.createElement('svg', { className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('rect', { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
        React.createElement('path', { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
    )
);

const InfoIcon = ({ size = 24, className = "" }) => (
    React.createElement('svg', { className, width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        React.createElement('circle', { cx: "12", cy: "12", r: "10" }),
        React.createElement('path', { d: "M12 16v-4" }),
        React.createElement('path', { d: "M12 8h.01" })
    )
);

// Stop words list
const STOP_WORDS = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
    'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
    'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'am', 'im', 'ive',
    'dont', 'cant', 'wont', 'yeah', 'oh', 'ooh', 'la', 'na', 'gonna', 'wanna', 'gotta', 'chorus', 'verse', 'bridge', 'intro', 'outro', 'repeat'
]);

function LyricsWordCloud() {
    const [artist, setArtist] = useState('');
    const [song, setSong] = useState('');
    const [lyrics, setLyrics] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [wordData, setWordData] = useState([]);
    const [showManualInput, setShowManualInput] = useState(false);
    const [fetchingLyrics, setFetchingLyrics] = useState(false);

    // Generate Genius search URL
    const getGeniusUrl = () => {
        const query = `${song} ${artist}`.trim();
        return `https://genius.com/search?q=${encodeURIComponent(query)}`;
    };

    // Generate Google search URL
    const getSearchUrl = () => {
        const query = `${song} ${artist} lyrics`.trim();
        return `https://google.com/search?q=${encodeURIComponent(query)}`;
    };

    // Fetch lyrics from API
    const fetchLyrics = async () => {
        if (!artist || !song) {
            setError('Please enter both artist name and song title.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setFetchingLyrics(true);
        setError('');
        setLyrics('');

        try {
            // Try multiple APIs in sequence
            let lyricsText = null;
            
            // API 1: lyrics.ovh
            try {
                const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.lyrics) {
                        lyricsText = data.lyrics;
                    }
                }
            } catch (err) {
                console.log('lyrics.ovh failed:', err);
            }

            // API 2: Try with CORS proxy if first API failed
            if (!lyricsText) {
                try {
                    const proxyUrl = 'https://corsproxy.io/?';
                    const targetUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`;
                    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
                    if (response.ok) {
                        const data = await response.json();
                        if (data.lyrics) {
                            lyricsText = data.lyrics;
                        }
                    }
                } catch (err) {
                    console.log('Proxy attempt failed:', err);
                }
            }

            if (lyricsText) {
                setLyrics(lyricsText);
                setShowManualInput(true);
                // Auto-generate word cloud after fetching
                setTimeout(() => {
                    generateWordCloud(lyricsText);
                }, 500);
            } else {
                setError('Could not fetch lyrics automatically. Please use manual paste option.');
                setShowManualInput(true);
                setTimeout(() => setError(''), 5000);
            }
        } catch (err) {
            setError('Failed to fetch lyrics. Please try manual paste.');
            setShowManualInput(true);
            setTimeout(() => setError(''), 5000);
        } finally {
            setFetchingLyrics(false);
        }
    };

    // Paste from clipboard
    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setLyrics(text);
        } catch (err) {
            setError('Unable to read clipboard. Please paste manually.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Word cloud generation algorithm
    const generateWordCloud = (text) => {
        if (!text || text.trim().length === 0) {
            setError('Please enter some lyrics first.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Convert to lowercase and remove punctuation
            const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
            
            // Split by whitespace and filter
            const words = cleanText.split(/\s+/).filter(word => 
                word.length >= 3 && !STOP_WORDS.has(word)
            );

            if (words.length < 5) {
                setError('Not enough meaningful words found. Please add more lyrics.');
                setLoading(false);
                return;
            }

            // Count word frequency
            const frequencyMap = {};
            words.forEach(word => {
                frequencyMap[word] = (frequencyMap[word] || 0) + 1;
            });

            // Sort by frequency and take top 50
            const sortedWords = Object.entries(frequencyMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 50);

            // Calculate min and max frequency for normalization
            const frequencies = sortedWords.map(([_, freq]) => freq);
            const minFreq = Math.min(...frequencies);
            const maxFreq = Math.max(...frequencies);

            // Generate word data with random positioning and styling
            const wordsData = sortedWords.map(([word, freq]) => {
                // Normalize size: ((frequency - minFreq) / (maxFreq - minFreq)) * 40 + 14
                const normalizedSize = maxFreq === minFreq 
                    ? 34 
                    : ((freq - minFreq) / (maxFreq - minFreq)) * 40 + 14;

                // Random positioning (10% to 90%)
                const x = Math.random() * 80 + 10;
                const y = Math.random() * 80 + 10;

                // Random rotation (30% chance of -45 degrees)
                const rotation = Math.random() < 0.3 ? -45 : 0;

                // Random HSL color
                const hue = Math.floor(Math.random() * 360);
                const color = `hsl(${hue}, 70%, 50%)`;

                return {
                    word,
                    freq,
                    size: normalizedSize,
                    x,
                    y,
                    rotation,
                    color
                };
            });

            setWordData(wordsData);
        } catch (err) {
            setError('Failed to generate word cloud. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle manual generation
    const handleManualGenerate = () => {
        generateWordCloud(lyrics);
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

        // Render words
        wordData.forEach(word => {
            const x = (word.x / 100) * canvas.width;
            const y = (word.y / 100) * canvas.height;
            const fontSize = word.size * 2;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((word.rotation * Math.PI) / 180);
            
            // Text shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;

            ctx.fillStyle = word.color;
            ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(word.word, 0, 0);
            
            ctx.restore();
        });

        // Download
        const sanitizedArtist = artist.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const sanitizedSong = song.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const filename = sanitizedArtist && sanitizedSong 
            ? `${sanitizedArtist}-${sanitizedSong}-wordcloud.png`
            : 'song-wordcloud.png';

        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    // Clear all
    const clearAll = () => {
        setArtist('');
        setSong('');
        setLyrics('');
        setWordData([]);
        setShowManualInput(false);
        setError('');
    };

    return React.createElement('div', { className: "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6" },
        React.createElement('div', { className: "max-w-7xl mx-auto" },
            // Header
            React.createElement('div', { className: "text-center mb-8" },
                React.createElement('div', { className: "flex items-center justify-center gap-4 mb-4" },
                    React.createElement(CloudIcon, { size: 48, className: "text-purple-400" }),
                    React.createElement('h1', { className: "text-5xl font-bold text-white" }, "Lyrics Word Cloud Generator")
                ),
                React.createElement('p', { className: "text-purple-200 text-lg" }, "Visualize song lyrics as beautiful word clouds")
            ),

            // Input Card
            React.createElement('div', { className: "glass-card border border-white/20 rounded-2xl p-6 mb-6" },
                React.createElement('div', { className: "grid md:grid-cols-2 gap-4 mb-4" },
                    React.createElement('div', null,
                        React.createElement('label', { className: "block text-sm font-medium text-purple-200 mb-2" }, "Artist Name"),
                        React.createElement('input', {
                            type: "text",
                            placeholder: "e.g., Taylor Swift",
                            value: artist,
                            onChange: (e) => setArtist(e.target.value),
                            className: "w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        })
                    ),
                    React.createElement('div', null,
                        React.createElement('label', { className: "block text-sm font-medium text-purple-200 mb-2" }, "Song Title"),
                        React.createElement('input', {
                            type: "text",
                            placeholder: "e.g., Shake It Off",
                            value: song,
                            onChange: (e) => setSong(e.target.value),
                            className: "w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        })
                    )
                ),

                // Info Banner
                React.createElement('div', { className: "bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4" },
                    React.createElement('div', { className: "flex items-start gap-3" },
                        React.createElement(InfoIcon, { size: 20, className: "text-blue-400 flex-shrink-0 mt-0.5" }),
                        React.createElement('div', { className: "text-sm text-blue-200" },
                            React.createElement('strong', null, "How it works:"),
                            " Enter artist and song, then click 'Fetch Lyrics' to automatically scrape lyrics from online sources. If automatic fetch fails, use manual paste option."
                        )
                    )
                ),

                // Action Buttons
                React.createElement('div', { className: "flex flex-wrap gap-3" },
                    React.createElement('button', {
                        onClick: fetchLyrics,
                        disabled: (!song && !artist) || fetchingLyrics,
                        className: "flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    },
                        React.createElement(CloudIcon, { size: 18 }),
                        fetchingLyrics ? 'Fetching Lyrics...' : 'Fetch Lyrics Automatically'
                    ),
                    React.createElement('button', {
                        onClick: () => window.open(getGeniusUrl(), '_blank'),
                        disabled: !song && !artist,
                        className: "flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    },
                        React.createElement(SearchIcon, { size: 18 }),
                        "Search on Genius"
                    ),
                    React.createElement('button', {
                        onClick: () => setShowManualInput(true),
                        className: "flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    },
                        React.createElement(CopyIcon, { size: 18 }),
                        "Manual Paste"
                    ),

                    wordData.length > 0 && [
                        React.createElement('button', {
                            key: 'download',
                            onClick: downloadWordCloud,
                            className: "flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                        },
                            React.createElement(DownloadIcon, { size: 18 }),
                            "Download Word Cloud"
                        ),
                        React.createElement('button', {
                            key: 'clear',
                            onClick: clearAll,
                            className: "flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                        },
                            React.createElement(Trash2Icon, { size: 18 }),
                            "Clear"
                        )
                    ]
                )
            ),

            // Lyrics Input Section
            showManualInput && React.createElement('div', { className: "glass-card border border-white/20 rounded-2xl p-6 mb-6" },
                React.createElement('div', { className: "flex items-center justify-between mb-4" },
                    React.createElement('h2', { className: "text-2xl font-bold text-white" }, "Paste Lyrics"),
                    React.createElement('button', {
                        onClick: pasteFromClipboard,
                        className: "flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                    },
                        React.createElement(CopyIcon, { size: 16 }),
                        "Paste from Clipboard"
                    )
                ),
                React.createElement('textarea', {
                    value: lyrics,
                    onChange: (e) => setLyrics(e.target.value),
                    placeholder: "Paste your song lyrics here...",
                    className: "w-full h-64 bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                }),
                React.createElement('button', {
                    onClick: handleManualGenerate,
                    disabled: !lyrics.trim() || loading,
                    className: "w-full mt-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-4 rounded-lg transition-colors text-lg"
                },
                    React.createElement(CloudIcon, { size: 24 }),
                    loading ? 'Generating...' : 'Generate Word Cloud'
                )
            ),

            // Error Message
            error && React.createElement('div', { className: "bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6" },
                React.createElement('p', { className: "text-red-200 text-sm" }, error)
            ),

            // Word Cloud Display
            wordData.length > 0 && React.createElement('div', { className: "glass-card border border-white/20 rounded-2xl p-6 mb-6" },
                React.createElement('h2', { className: "text-2xl font-bold text-white mb-2" },
                    `Word Cloud ${song ? `for "${song}"` : ''} ${artist ? `by ${artist}` : ''}`
                ),
                React.createElement('div', { className: "relative min-h-[500px] bg-gradient-to-br from-slate-800/50 to-purple-900/50 rounded-xl overflow-hidden" },
                    wordData.map((word, index) =>
                        React.createElement('div', {
                            key: index,
                            className: "word-cloud-word absolute",
                            style: {
                                left: `${word.x}%`,
                                top: `${word.y}%`,
                                transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`,
                                fontSize: `${word.size}px`,
                                color: word.color,
                                fontWeight: 'bold',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                whiteSpace: 'nowrap'
                            },
                            title: `"${word.word}" appears ${word.freq} time${word.freq > 1 ? 's' : ''}`
                        }, word.word)
                    )
                ),
                React.createElement('p', { className: "text-purple-200 text-sm mt-4 text-center" },
                    `Top ${wordData.length} words • Hover to see frequency`
                )
            ),

            // Lyrics Display
            lyrics && wordData.length > 0 && React.createElement('div', { className: "glass-card border border-white/20 rounded-2xl p-6 mb-6" },
                React.createElement('h2', { className: "text-2xl font-bold text-white mb-4" }, "Lyrics Used"),
                React.createElement('pre', { className: "bg-slate-900/50 rounded-lg p-4 text-purple-200 text-sm max-h-96 overflow-y-auto whitespace-pre-wrap" },
                    lyrics
                )
            ),

            // How To Use
            !showManualInput && wordData.length === 0 && React.createElement('div', { className: "glass-card border border-white/20 rounded-2xl p-8 text-center" },
                React.createElement(CloudIcon, { size: 64, className: "text-purple-400 mx-auto mb-6" }),
                React.createElement('h2', { className: "text-2xl font-bold text-white mb-6" }, "How to Use"),
                React.createElement('div', { className: "max-w-2xl mx-auto space-y-4 text-left" },
                    [1, 2, 3, 4].map(num => {
                        const steps = [
                            "Enter the artist name and song title above",
                            'Click "Fetch Lyrics Automatically" to scrape lyrics from online sources',
                            'The word cloud will be generated automatically once lyrics are fetched',
                            'If automatic fetch fails, use "Manual Paste" option or search on Genius/Google'
                        ];
                        return React.createElement('div', { key: num, className: "flex items-start gap-4" },
                            React.createElement('div', { className: "flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold" }, num),
                            React.createElement('p', { className: "text-purple-200 pt-1" }, steps[num - 1])
                        );
                    })
                )
            )
        )
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(LyricsWordCloud));
