# Lyrics Word Cloud Generator with Web Scraping

A complete lyrics word cloud generation system with automatic scraping from Genius.com and manual paste fallback.

## Features

✅ **Automatic Lyrics Scraping** - Fetch lyrics from Genius.com with one click  
✅ **Manual Paste Fallback** - Paste lyrics manually if scraping fails  
✅ **Word Frequency Analysis** - Filters 150+ stop words  
✅ **Interactive Word Cloud** - Hover to see word frequency  
✅ **PNG Download** - Export 1200x800px high-quality images  
✅ **Beautiful UI** - Glassmorphism design with purple gradient  

## Architecture

```
Frontend (React/Vite) → Backend (Express/Node.js) → Genius.com
     Port 5173              Port 3001              (Scraping)
```

## Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

## Running the Application

### Start Backend Server (Terminal 1)
```bash
cd server
npm start
```
Backend will run on **http://localhost:3001**

### Start Frontend Server (Terminal 2)
```bash
npm run dev
```
Frontend will run on **http://localhost:5173**

## Usage

### Method 1: Auto-Fetch (Recommended)
1. Enter artist name (e.g., "Adele")
2. Enter song title (e.g., "Hello")
3. Click **"Auto-Fetch Lyrics"** button
4. Wait for scraping to complete
5. Word cloud generates automatically

> **Note**: Scraping may fail if Genius.com changes their page structure. Use Method 2 as fallback.

### Method 2: Manual Paste (Fallback)
1. Enter artist and song
2. Click **"Search on Genius"** or **"Search on Google"**
3. Copy lyrics from the search results
4. Click **"Paste Lyrics Here"**
5. Paste lyrics in the textarea
6. Click **"Generate Word Cloud"**

### Download Word Cloud
- Click **"Download Word Cloud"** button
- PNG file (1200x800px) will download
- Filename: `{artist}-{song}-wordcloud.png`

## API Endpoints

### Backend Server (Port 3001)

#### Get Lyrics
```
GET /api/lyrics?artist={artist}&song={song}
```
**Response:**
```json
{
  "success": true,
  "lyrics": "...",
  "artist": "Adele",
  "song": "Hello",
  "url": "https://genius.com/...",
  "thumbnail": "..."
}
```

#### Search Songs
```
GET /api/search?query={query}
```

#### Health Check
```
GET /health
```

## Project Structure

```
task08/
├── server/                  # Backend (Express)
│   ├── package.json
│   ├── server.js           # Main server file
│   └── .env                # Environment config
├── src/                     # Frontend (React)
│   ├── App.jsx             # Main component
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (icons)

### Backend
- Express.js
- Axios (HTTP requests)
- Cheerio (HTML parsing)
- CORS middleware

## Configuration

### Backend (.env)
```env
PORT=3001
GENIUS_ACCESS_TOKEN=  # Optional
```

### Rate Limiting
- **Limit**: 10 requests per minute per IP
- **Window**: 60 seconds
- Prevents abuse and IP bans

## Troubleshooting

### Backend not connecting
```
Error: Failed to connect to backend server
```
**Solution**: Make sure backend is running on port 3001
```bash
cd server
npm start
```

### Scraping fails
```
Error: Could not extract lyrics from the page
```
**Solution**: Use manual paste method. Genius.com may have changed their HTML structure.

### CORS errors
**Solution**: Backend has CORS enabled. Make sure both servers are running.

## Legal Disclaimer

⚠️ **Web Scraping Notice**  
Scraping Genius.com may violate their Terms of Service. This project is for educational purposes only. For production use, consider:
- Using official Genius API (requires token)
- Licensed lyrics APIs (Musixmatch, LyricFind)
- Manual paste only

## Development

### Frontend Development
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd server
npm start          # Start server
npm run dev        # Start with auto-reload (Node 18+)
```

## Future Enhancements

- [ ] Genius API integration (official)
- [ ] Multiple lyrics sources
- [ ] Caching frequently requested lyrics
- [ ] Custom color schemes
- [ ] Word cloud shapes (heart, circle, etc.)
- [ ] Export to SVG/PDF
- [ ] Save/load word clouds

## License

MIT License - Educational purposes only

## Author

Created as part of Task 08: Lyrics scraping and word cloud generation system
