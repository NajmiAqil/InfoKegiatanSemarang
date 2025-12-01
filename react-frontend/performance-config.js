// React Performance Optimization Config
// Add this to your package.json scripts for production build

{
  "scripts": {
    "build:optimized": "GENERATE_SOURCEMAP=false react-scripts build",
    "analyze": "source-map-explorer 'build/static/js/*.js'",
    "lighthouse": "lighthouse http://localhost:3000 --view"
  },
  "devDependencies": {
    "source-map-explorer": "^2.5.3"
  }
}

// Performance tips:
// 1. Code splitting is already handled by React.lazy if you want to add it
// 2. Images should be optimized (WebP format recommended)
// 3. Enable gzip compression on server
// 4. Consider adding service worker for offline support
// 5. Lazy load calendar component for faster initial load

// To implement lazy loading for heavy components:
// const CalendarMonth = React.lazy(() => import('./CalendarMonth'));
// Then wrap in <Suspense fallback={<div>Loading...</div>}>
