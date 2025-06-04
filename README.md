# YouTube Comment Card Generator

A Next.js application for generating beautiful comment cards from YouTube comments using Puppeteer for high-quality rendering.

## ✨ Features

-   **High-Quality Rendering**: Uses Puppeteer for crisp, high-DPI image generation
-   **Dynamic Height Calculation**: Automatically adjusts card height based on content
-   **Customizable Design**: Full control over colors, fonts, sizes, and layout
-   **Performance Optimized**: React Hook Form, memoization, and lazy loading
-   **Multiple Card Sizes**: Small (400px), Medium (600px), Large (800px), X-Large (1000px)
-   **Date Format Options**: US and French date formats
-   **High-DPI Support**: 1x, 2x, and 3x scale factors for different display densities

## 🚀 Performance Optimizations

### Form Performance

-   **React Hook Form**: Eliminates unnecessary re-renders and provides better form state management
-   **Manual Submission**: Form only submits when the user clicks "Generate Comment Card"
-   **Memoized Components**: Form inputs are memoized to prevent unnecessary re-renders
-   **Validation**: Built-in form validation with error messages

### Rendering Performance

-   **React.memo**: Components are memoized to prevent unnecessary re-renders
-   **Lazy Loading**: Heavy components are loaded on-demand
-   **Image Optimization**: Native image lazy loading and proper sizing
-   **Suspense Boundaries**: Graceful loading states for async components

### API Performance

-   **Puppeteer Optimization**:
    -   Efficient viewport sizing
    -   Minimal browser arguments
    -   Proper resource cleanup
    -   Optimized screenshot capture

## 🛠️ Installation

```bash
# Clone the repository
git clone [repository-url]
cd youtubecommentcard

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your YouTube API key to .env.local

# Run the development server
pnpm dev
```

## 📝 Usage

1. **Enter YouTube Comment URL**: Paste a YouTube comment URL into the form
2. **Customize Settings**: Adjust colors, fonts, padding, and other design options
3. **Click Generate**: Click "Generate Comment Card" to create the image
4. **Download**: Click "Download Comment Card" to save the generated image

### Form Features

-   **URL Validation**: Automatically validates YouTube URLs
-   **Real-time Preview**: Preview updates when settings change (after generation)
-   **Error Handling**: Clear error messages for invalid inputs
-   **Loading States**: Visual feedback during card generation

## 🎨 Customization Options

-   **Card Size**: Small to X-Large (400px - 1000px wide)
-   **Colors**: Background and text colors with color picker
-   **Typography**: Font size (12px - 24px)
-   **Layout**: Padding (8px - 48px) and border radius (0px - 32px)
-   **Content**: Toggle author image and like count visibility
-   **Quality**: High-DPI rendering (1x, 2x, 3x scale factors)
-   **Date Format**: US (MM/DD/YYYY) or French (DD/MM/YYYY)

## 🔧 API Routes

-   `/api/comment`: Fetches YouTube comment data
-   `/api/card-comment-puppeteer-advanced`: Generates comment card images with Puppeteer

## 🎯 Performance Tips

1. **Use appropriate scale factors**: Higher scale factors (2x, 3x) produce better quality but larger files
2. **Optimize card size**: Choose the smallest size that meets your needs
3. **Minimize form changes**: The app only regenerates when you submit the form
4. **Browser caching**: Generated images are cached for better performance

## 🏗️ Architecture

-   **Frontend**: Next.js 14 with TypeScript
-   **Forms**: React Hook Form for optimized form handling
-   **State Management**: Zustand for card options
-   **Styling**: Tailwind CSS
-   **Image Generation**: Puppeteer for high-quality rendering
-   **Performance**: React.memo, lazy loading, and optimized components

## 📱 Browser Compatibility

-   Chrome/Chromium-based browsers (recommended)
-   Firefox
-   Safari
-   Edge

## 🚨 Known Issues

-   Medium size (600px) positioning has been optimized and should work correctly
-   Large comment texts may require scrolling in preview
-   High scale factors (3x) may take longer to generate

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
