# Technology Stack - SanaHolidayNaUlit.com

**Status**: Planning Phase  
**Target**: Production-ready Philippine holiday platform  
**Updated**: September 27, 2024

## Overview

SanaHolidayNaUlit.com will be built as a high-performance, static-first website optimized for mobile users in the Philippines. The stack prioritizes speed, simplicity, and extensibility for future monetization.

## Core Technology Decisions

### Frontend Framework: **Astro.js**

**Why Astro:**
- **Performance-first**: Static HTML generation for LCP < 1.0s target
- **Minimal JavaScript**: Ships only necessary JS, perfect for mobile users
- **SEO excellence**: Pre-rendered HTML for better search visibility
- **Ad-friendly**: Static pages load ads faster with better CLS control
- **Extensible**: Easy to add components, analytics, and monetization

**Alternative considered**: 
- Next.js (rejected: overkill for static content + countdown)
- Vanilla HTML/CSS/JS (rejected: harder to scale and maintain)

### Styling: **Vanilla CSS + Design System**

**Approach:**
- Custom CSS following established Zen Minimalist design system
- CSS Variables for consistent theming
- No framework dependencies (Tailwind not needed for this scope)
- Mobile-first responsive design

**Why not CSS frameworks:**
- Smaller bundle size for better performance
- Full control over design system implementation
- Easier to maintain custom aesthetic

### JavaScript: **Vanilla ES6+**

**Client-side features:**
- Holiday countdown timer (updates every second)
- Data freshness checking and fallback handling
- Smooth scrolling and scroll-spy navigation
- Intersection Observer for lazy loading

**Why vanilla:**
- No framework overhead competing with ad scripts
- Faster execution for time-critical countdown updates
- Easier debugging and maintenance
- Aligns with minimalist design philosophy

## Architecture Pattern

### **Hybrid Static + Runtime Data Strategy**

```
Build Time:           Runtime:
┌─────────────┐      ┌──────────────┐
│ Fetch API   │────▶ │ Static HTML  │
│ Generate    │      │ + Fallback   │
│ Static Site │      │ Data         │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Client Check │
                     │ Fresh Data   │
                     │ Show Stale   │
                     │ Indicators   │
                     └──────────────┘
```

**Benefits:**
- ⚡ Ultra-fast initial load (static HTML)
- 🔄 Always fresh data (runtime checks)  
- 🛡️ Resilient (works if API fails)
- 📱 Perfect mobile performance

## Data Flow

### Build-time Data Fetching with Type-Safe Environment Variables
```javascript
// astro.config.mjs - Using modern astro:env API (Astro 5.0+)
import { defineConfig, envField } from "astro/config"

export default defineConfig({
  env: {
    schema: {
      // Type-safe environment variables schema
      API_BASE_URL: envField.string({ 
        context: "server", 
        access: "public", 
        default: "https://api.sanaholidaynaulit.com" 
      }),
      API_SECRET: envField.string({ 
        context: "server", 
        access: "secret",
        optional: true 
      })
    }
  }
})

// src/pages/index.astro
---
import { API_BASE_URL } from "astro:env/server"

// Build-time data fetching with type safety
const holidays = await fetch(`${API_BASE_URL}/holidays`)
  .then(r => r.json())
  .catch(() => ({ 
    fallback: true, 
    holidays: [],
    source: 'fallback-data',
    timestamp: new Date().toISOString()
  }))
---
```

### Runtime Enhancement with Type-Safe Client Variables
```javascript
// Client-side freshness checking using astro:env client API
const checkDataFreshness = async () => {
  try {
    // Import from astro:env/client for type-safe client-side access
    const { API_BASE_URL } = await import('astro:env/client')
    
    const fresh = await fetch(`${API_BASE_URL}/api/holidays`)
    const data = await fresh.json()
    
    // PRD requirement: Show stale indicator if >24h old
    if (isStale(data.generatedAt)) {
      showStaleDataWarning()
    }
    
    updateCountdown(data)
    console.log(`Data loaded from: ${API_BASE_URL}`)
  } catch (error) {
    // Graceful degradation using build-time data
    console.log('API unavailable, using cached data:', error.message)
  }
}

// Alternative: Direct access pattern for inline scripts
// <script>
//   import { API_BASE_URL } from "astro:env/client"
//   // Client-side code here
// </script>
```

## Performance Targets

### Core Web Vitals (from PRD)
```
LCP (Largest Contentful Paint): ≤ 1.0s on mobile 4G
CLS (Cumulative Layout Shift): ≤ 0.05 (including ads)
FID (First Input Delay): ≤ 100ms
Lighthouse Performance Score: ≥ 95
```

### Optimization Strategies
- **Static HTML**: Pre-rendered pages for instant loading
- **Minimal JavaScript**: Only essential client-side code
- **Font optimization**: Roboto via Google Fonts with display=swap
- **Image optimization**: Astro built-in image optimization
- **Ad CLS prevention**: Pre-allocated ad container spaces
- **Lazy loading**: Intersection Observer for non-critical content

## Deployment & CI/CD

### Hosting: **Cloudflare Pages**
**Why Cloudflare:**
- Free tier suitable for MVP
- Excellent global CDN (important for Filipino users)
- Built-in analytics and performance monitoring
- Easy integration with Cloudflare Workers (future API needs)
- Zero-downtime deployments

### Automated Updates Strategy
```yaml
# GitHub Actions workflow
Schedule: Daily at midnight PHT (cron: '0 16 * * *')
Webhook: Backend API data changes
Manual: Government holiday announcements

Build Process:
1. Fetch latest holiday data from API
2. Generate static Astro site
3. Deploy to Cloudflare Pages
4. Verify deployment health
```

## Development Workflow

### Project Structure
```
src/
├── pages/
│   ├── index.astro           # Homepage with countdown
│   ├── holidays.astro        # Holiday table/calendar
│   ├── visualizer.astro      # Long weekend visualizer  
│   └── about.astro           # About page
├── components/
│   ├── Countdown.astro       # Holiday countdown timer
│   ├── HolidayTable.astro    # Sortable holiday table
│   ├── Calendar.astro        # Mini calendar component
│   ├── AdSlot.astro          # Ad container component
│   └── Layout.astro          # Base page layout
├── styles/
│   ├── global.css            # Design system variables
│   └── components/           # Component-specific styles
└── scripts/
    ├── countdown.js          # Timer logic
    ├── data-fetcher.js       # API interaction
    └── scroll-spy.js         # Navigation helpers
```

### Environment Configuration with astro:env (Recommended)

**Modern Type-Safe Approach (Astro 5.0+):**
```bash
# .env.development (local development)
API_BASE_URL=http://localhost:3001
API_SECRET=dev-secret-key

# .env.production (production build)
API_BASE_URL=https://api.sanaholidaynaulit.com
API_SECRET=prod-secret-from-cloudflare

# .env.local (override for local testing)
API_BASE_URL=http://localhost:8080  # Custom local backend port
```

**Schema Definition in Astro Config:**
```javascript
// astro.config.mjs - Type-safe schema definition
import { defineConfig, envField } from "astro/config"

export default defineConfig({
  env: {
    schema: {
      // Client-accessible variables (for runtime API calls)
      API_BASE_URL: envField.string({ 
        context: "client", 
        access: "public"
      }),
      
      // Server-only variables (for build-time fetching)
      API_SECRET: envField.string({ 
        context: "server", 
        access: "secret",
        optional: true
      })
    }
  }
})
```

**Usage in Components:**
```javascript
// Server-side (build-time)
---
import { API_BASE_URL, API_SECRET } from "astro:env/server"
const data = await fetch(`${API_BASE_URL}/holidays`, {
  headers: { 'Authorization': `Bearer ${API_SECRET}` }
})
---

// Client-side (runtime)
<script>
  import { API_BASE_URL } from "astro:env/client"
  // Client-side API calls
</script>
```

**Legacy Support (Still Available):**
```javascript
// Fallback to import.meta.env if needed
const apiBase = import.meta.env.PUBLIC_API_BASE_URL || 'https://api.sanaholidaynaulit.com'
const isDev = import.meta.env.DEV
```

### Development Commands
```bash
# Project setup
npm create astro@latest sanaholidaynauli
cd sanaholidaynauli

# Generate types for astro:env schema
npm run astro sync   # Generates TypeScript types for environment variables

# Local development with localhost backend
npm run dev          # Uses .env.development (localhost:3001)

# Test with different environments using --mode flag
npm run dev -- --mode staging    # Uses .env.staging
npm run dev -- --mode testing    # Uses .env.testing

# Override environment variables inline
API_BASE_URL=http://localhost:8080 npm run dev

# Production build
npm run build        # Uses .env.production
npm run build -- --mode staging  # Build with staging environment

# Preview production build locally
npm run preview      # Test production bundle locally

# Type checking and validation
npm run astro check  # TypeScript and astro:env validation

# Deploy to Cloudflare Pages
npm run deploy       # Production deployment
```

### Local Testing Workflow

**Backend + Frontend Development:**
```bash
# Terminal 1: Start local backend API
cd ../backend
npm run dev          # Runs on localhost:3001

# Terminal 2: Start Astro frontend
cd ../frontend
npm run dev          # Automatically connects to localhost:3001

# Terminal 3: Test different scenarios
curl http://localhost:3001/api/holidays    # Test API directly
curl http://localhost:4321                # Test Astro frontend
```

**Mock Data for Offline Development:**
```javascript
// src/data/mock-holidays.js
export const mockHolidays = [
  { name: 'New Year\'s Day', iso: '2024-01-01T00:00:00+08:00', type: 'regular' },
  // ... complete mock dataset for offline development
]

// src/utils/api.js
import { mockHolidays } from '../data/mock-holidays.js'

export const fetchHolidays = async () => {
  const API_BASE = import.meta.env.PUBLIC_API_BASE_URL
  const USE_MOCK = import.meta.env.PUBLIC_USE_MOCK_DATA === 'true'
  
  if (USE_MOCK) {
    console.log('Using mock data for development')
    return { holidays: mockHolidays, source: 'mock' }
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/holidays`)
    const data = await response.json()
    return { ...data, source: 'api' }
  } catch (error) {
    console.log('API failed, falling back to mock data')
    return { holidays: mockHolidays, source: 'fallback' }
  }
}
```

## Future Extensibility

### Monetization-Ready Architecture

**Ad Integration:**
```javascript
// components/AdSlot.astro - Pre-built for CLS compliance
---
const { position, size, lazy = true } = Astro.props
---
<div class="ad-container" data-size={size}>
  <!-- Pre-allocated space prevents layout shift -->
</div>
```

**Analytics Integration:**
```javascript
// Built-in Astro analytics support
import { analytics } from 'astro/analytics'

// Google Analytics, Cloudflare Analytics, etc.
```

**A/B Testing:**
```javascript
// Edge computing with Cloudflare Workers
// Test ad placements, design variants, pricing
```

### Planned Feature Extensions
- **Premium Calendar Downloads**: PDF/ICS generation
- **Notification System**: Holiday reminders via email/push
- **Travel Integration**: Hotel/flight booking affiliate links
- **Corporate Features**: Bulk calendar subscriptions
- **Regional Holidays**: Provincial/city-specific holidays
- **API Monetization**: Developer access to holiday data

## Third-party Integrations

### Current Integrations
- **Google Fonts**: Roboto font family (300, 400, 500)
- **Backend API**: Holiday data source
- **Cloudflare Pages**: Hosting and CDN

### Planned Integrations
- **Google AdSense**: Primary ad network
- **Google Analytics**: User behavior tracking
- **Mailchimp/ConvertKit**: Email newsletter
- **Stripe**: Payment processing (premium features)
- **Social APIs**: Sharing optimization

## Security & Privacy

### Data Handling
- **No user data collection** in MVP
- **GDPR compliance** ready for EU Filipino diaspora
- **Privacy-focused analytics** (Cloudflare vs Google Analytics)

### Content Security
- **CSP headers** for ad script security
- **HTTPS only** via Cloudflare
- **Regular dependency updates** via Dependabot

## Development Environment

### Required Tools
```bash
Node.js: ≥18.20.8, ≥20.3.0, or ≥22.0.0 (Astro 5.0+ requirements)
Package Manager: npm (consistency with Astro docs)
Git: Version control
VS Code: Recommended editor with Astro extension
```

### Node.js Version Requirements
Astro supports **even-numbered** Node.js versions only. Current minimum supported versions:
- **v18.20.8** (LTS)
- **v20.3.0** (LTS) 
- **v22.0.0** (Current)

Versions v19 and v21 are **not supported**.

### Recommended Extensions
- Astro (astro-build.astro-vscode)
- Prettier (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)

## Migration from Prototype

### Conversion Strategy
```bash
# Current prototype → Astro pages
design4/index.html → src/pages/index.astro
design4/longweekendvisualizer.html → src/pages/visualizer.astro
design4/style.css → src/styles/global.css
design4/script.js → src/scripts/ (modularized)

# Design system preservation
- Keep existing CSS variables and component patterns
- Maintain established color palette and typography
- Preserve accessibility features and responsive behavior
```

## Success Metrics

### Technical KPIs
- **Lighthouse Performance**: ≥ 95 (target from PRD)
- **Build Time**: < 30 seconds (for fast CI/CD)
- **Bundle Size**: < 100KB initial JavaScript load
- **Time to Interactive**: < 2 seconds on mobile

### Business KPIs (Future)
- **Ad Revenue**: Target CPC/CPM optimization
- **User Engagement**: Time on site, return visits
- **SEO Performance**: Organic traffic growth
- **Conversion Rate**: Premium feature adoption

---

## Technology Decision Log

### September 27, 2024
- **Chosen**: Astro.js 5.0+ over Next.js for performance-first static generation
- **Chosen**: astro:env API over manual environment variable handling for type safety
- **Chosen**: Vanilla CSS over Tailwind for design system control  
- **Chosen**: Cloudflare Pages over Vercel for CDN performance in Philippines
- **Planned**: Hybrid build-time + runtime data strategy with fallback mechanisms
- **Updated**: Node.js requirements to align with Astro 5.0+ (even-numbered versions only)

### Rationale
This stack prioritizes the core user need (fast holiday information) while providing a solid foundation for scaling into a profitable platform. The emphasis on performance, simplicity, and extensibility aligns with both immediate MVP requirements and long-term business goals.