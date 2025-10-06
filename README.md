# Live Decibel Meter for OBS Studio

A beautiful, customizable live decibel meter designed for OBS Studio overlays with a liquid glass design aesthetic.

## Features

- **Real-time Decibel Monitoring**: Polls a web server for live decibel data
- **Liquid Glass Design**: Beautiful circular gauge with glassmorphism effects
- **Customizable Settings**: 
  - Change polling URL and interval
  - Customize colors (gauge, background, text)
  - Adjust container size
  - Toggle settings button visibility
- **Max Value Tracking**: Displays the highest decibel reading
- **Elapsed Time**: Shows how long the meter has been running
- **OBS-Ready**: Optimized for use as a browser source in OBS Studio

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

4. **Configure for Your Setup**:
   - Open the settings panel (⚙️ button)
   - Change the polling URL to your decibel meter server
   - Adjust colors and size as needed

## Usage with OBS Studio

1. In OBS Studio, add a new "Browser Source"
2. Set the URL to `http://localhost:3000` (or your server's IP)
3. Set the width and height (recommended: 400x500)
4. Enable "Shutdown source when not visible" for better performance

## API Integration

The meter expects JSON data from your polling URL. It supports multiple formats:

```json
// Format 1: Direct decibel value
{"decibel": 65.5}

// Format 2: Generic value
{"value": 65.5}

// Format 3: Level property
{"level": 65.5}

// Format 4: Any numeric property
{"dB": 65.5}
```

## Settings

- **Polling URL**: The endpoint to fetch decibel data from
- **Polling Interval**: How often to fetch data (50-5000ms)
- **Gauge Color**: Color of the liquid fill effect
- **Background Color**: Main background color
- **Text Color**: Color of all text elements
- **Container Size**: Scale factor for the entire display (50%-200%)
- **Show Settings**: Toggle the settings button visibility

## File Structure

```
├── index.html          # Main HTML structure
├── styles.css          # CSS with liquid glass design
├── script.js           # JavaScript functionality
├── server.js           # Local development server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Customization

The meter automatically saves your settings to localStorage, so your preferences persist between sessions. You can modify the CSS in `styles.css` to further customize the appearance.

## Performance Notes

- The meter pauses polling when the browser tab is not visible
- Optimized for smooth 60fps animations
- Uses CSS transforms and backdrop-filter for hardware acceleration
- Minimal CPU usage when not actively displaying

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need to enable backdrop-filter)
- Mobile browsers: Responsive design included

## Troubleshooting

**No data showing**: Check that your polling URL is correct and accessible
**Settings not saving**: Ensure localStorage is enabled in your browser
**Performance issues**: Reduce polling interval or disable animations in settings


