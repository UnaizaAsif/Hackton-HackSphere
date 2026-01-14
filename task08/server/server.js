import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting map to prevent abuse
const requestCounts = new Map();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }

    const requests = requestCounts.get(ip).filter(time => now - time < RATE_WINDOW);

    if (requests.length >= RATE_LIMIT) {
        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please wait a minute.'
        });
    }

    requests.push(now);
    requestCounts.set(ip, requests);
    next();
};

// Clean up old rate limit data every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, requests] of requestCounts.entries()) {
        const validRequests = requests.filter(time => now - time < RATE_WINDOW);
        if (validRequests.length === 0) {
            requestCounts.delete(ip);
        } else {
            requestCounts.set(ip, validRequests);
        }
    }
}, 300000);

/**
 * Search for a song on Genius
 */
async function searchGenius(query) {
    try {
        const response = await axios.get('https://genius.com/api/search/multi', {
            params: { q: query },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const sections = response.data.response.sections;
        const topHits = sections.find(section => section.type === 'top_hit');

        if (topHits && topHits.hits && topHits.hits.length > 0) {
            return topHits.hits[0].result;
        }

        // Fallback to song section
        const songs = sections.find(section => section.type === 'song');
        if (songs && songs.hits && songs.hits.length > 0) {
            return songs.hits[0].result;
        }

        return null;
    } catch (error) {
        console.error('Search error:', error.message);
        return null;
    }
}

/**
 * Scrape lyrics from a Genius song page
 */
async function scrapeLyrics(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Genius uses data-lyrics-container attribute for lyrics
        const lyricsContainers = $('[data-lyrics-container="true"]');

        if (lyricsContainers.length === 0) {
            return null;
        }

        let lyrics = '';
        lyricsContainers.each((i, container) => {
            // Get text and preserve line breaks
            $(container).find('br').replaceWith('\n');
            lyrics += $(container).text() + '\n';
        });

        // Clean up the lyrics
        lyrics = lyrics
            .replace(/\[.*?\]/g, '') // Remove [Verse], [Chorus], etc.
            .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
            .trim();

        return lyrics;
    } catch (error) {
        console.error('Scraping error:', error.message);
        return null;
    }
}

// API Routes

/**
 * GET /api/lyrics
 * Query params: artist, song
 */
app.get('/api/lyrics', rateLimiter, async (req, res) => {
    try {
        const { artist, song } = req.query;

        if (!artist || !song) {
            return res.status(400).json({
                success: false,
                error: 'Both artist and song parameters are required'
            });
        }

        console.log(`Fetching lyrics for: ${artist} - ${song}`);

        // Search for the song
        const query = `${song} ${artist}`;
        const songData = await searchGenius(query);

        if (!songData) {
            return res.status(404).json({
                success: false,
                error: 'Song not found on Genius'
            });
        }

        // Scrape lyrics from the song page
        const lyrics = await scrapeLyrics(songData.url);

        if (!lyrics) {
            return res.status(404).json({
                success: false,
                error: 'Could not extract lyrics from the page'
            });
        }

        res.json({
            success: true,
            lyrics,
            artist: songData.primary_artist.name,
            song: songData.title,
            url: songData.url,
            thumbnail: songData.song_art_image_thumbnail_url
        });

    } catch (error) {
        console.error('API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/search
 * Query params: query
 */
app.get('/api/search', rateLimiter, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required'
            });
        }

        const songData = await searchGenius(query);

        if (!songData) {
            return res.status(404).json({
                success: false,
                error: 'No results found'
            });
        }

        res.json({
            success: true,
            result: {
                artist: songData.primary_artist.name,
                song: songData.title,
                url: songData.url,
                thumbnail: songData.song_art_image_thumbnail_url
            }
        });

    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Lyrics scraper backend running on http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   GET /api/lyrics?artist=<artist>&song=<song>`);
    console.log(`   GET /api/search?query=<query>`);
    console.log(`   GET /health`);
});
