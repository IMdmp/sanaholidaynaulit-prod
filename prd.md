# Product Requirements Document

**Owner**: Danny  
**Date**: Sep 12, 2025  
**Status**: Development Phase

## Summary

SanaHolidayNaUlit.com addresses the need for instant, accurate Philippine holiday information by providing a fast, mobile-optimized countdown timer and comprehensive holiday listings. The primary audience is Philippines-based office workers planning vacations and long weekends; secondary audiences include the Filipino diaspora, students, HR professionals, and travel planners. Success will be measured through user engagement, performance metrics (sub-second load times), and ad monetization while maintaining an accessible, authority-positioned holiday resource.

## 1. Problem & Opportunity

**Problem**: Filipinos need quick, accurate information about national holidays for planning work, travel, and personal activities. Existing solutions are slow, cluttered, or unreliable.

**Opportunity**: Provide an instant, mobile-first holiday countdown and listing service that's fast, clean, and always up-to-date.

**Target Market**: Philippines-based office workers (primary), HR professionals and travel planners; secondary: Filipino diaspora and students.

## 2. Goals & Success Criteria

### Primary Goals (MVP)

- Instant countdown to next national holiday
- Fast, mobile-optimized holiday listings
- High performance with minimal loading time
- Accessible user experience (WCAG 2.2 AA)
- SEO-optimized for organic discovery

### Business Goals

- Ad monetization with minimal CLS impact
- High user engagement and return visits
- Position as authoritative Philippine holiday source

### Non-Goals (MVP Scope)

- Server-side rendering or dynamic builds
- User accounts or personalization
- Local/regional holidays (national only)
- Admin interfaces (API-managed)

## 3. User Personas & Jobs-to-be-Done

### Primary Users

**Office Workers & Students**

- Need: Plan work schedules and study periods around holidays
- JTBD: "How many days until I get a break?"
- Usage: Quick mobile checks during work/study hours

**HR Professionals**

- Need: Accurate holiday schedules for payroll and planning
- JTBD: "What holidays affect our work calendar this year?"
- Usage: Reference for official company calendars

**Travel Planners**

- Need: Identify long weekends for trip planning
- JTBD: "When can I plan a vacation around holidays?"
- Usage: Strategic planning for bookings and itineraries

### Core Jobs-to-be-Done

1. **"How long until the next holiday?"** (Primary - drives countdown feature)
2. **"What holidays are coming up?"** (Secondary - drives upcoming list)
3. **"Which holidays create long weekends?"** (Tertiary - drives long weekend indicators)

## 4. Core Product Features

### Homepage Experience

**Primary Feature: Holiday Countdown**

- Large, prominent countdown timer (DD:HH:MM:SS format)
- Displays time remaining until next national holiday
- "Today is [Holiday Name]" mode when holiday arrives
- Countdown targets midnight (00:00) Philippine Time

**Supporting Features**

- Next holiday name and date prominently displayed
- Long weekend indicator when applicable
- Top 3 upcoming holidays preview
- Social sharing capabilities
- Strategic ad placements (below-the-fold, non-intrusive)

### Holidays Listing Page

**Core Functionality**

- Comprehensive yearly holiday table
- Sortable by date, name, type, and long weekend status
- Year navigation (current and next year)
- Holiday type indicators (regular vs special non-working)
- Long weekend badges for 3+ day periods

**Data Presentation**

- Date in Philippine format
- Holiday names in English with optional Filipino aliases
- Official status indicators (confirmed, tentative, pending)
- Mobile-optimized table design

### Supporting Pages & Features

**About/Information Page**

- Data sources and methodology explanation
- Timezone and calculation notes
- Contact and feedback information

**Localization**

- English/Taglish language toggle
- Philippine-specific date formatting
- Cultural context for holiday significance

### User Experience Principles

- **Mobile-first**: Optimized for smartphone usage
- **Performance**: Sub-second load times
- **Accessibility**: Screen reader friendly, keyboard navigation
- **Reliability**: Graceful handling of data unavailability

## 5. Data Requirements

### Holiday Information Schema

Each holiday must contain:

- **Date**: Specific calendar date (Philippine civil date)
- **Name**: Official holiday name in English
- **Type**: Classification (regular or special non-working day)
- **Status**: Official confirmation level (confirmed/tentative/pending)
- **Alias**: Optional Filipino language name
- **Long Weekend**: Indicator for 3+ consecutive days off

### Data Freshness Requirements

- **Countdown Data**: Updated every 6 hours maximum
- **Holiday Lists**: Updated daily
- **Metadata**: Updated daily (available years, last check time)
- **Staleness Indicator**: User notification if data >24 hours old

### Data Accuracy Standards

- **Source**: Official Philippine government proclamations
- **Timezone**: All dates in Philippine Standard Time (UTC+8)
- **Updates**: Real-time incorporation of new proclamations
- **Validation**: Cross-reference multiple official sources

### Error Handling Requirements

- **Graceful Degradation**: Show cached/fallback data when live data unavailable
- **User Communication**: Clear, friendly error messages
- **Offline Support**: Basic functionality without internet connection

## 6. Business Logic Requirements

### Countdown Behavior

- **Target Time**: Holiday starts at 00:00 Philippine Time
- **Update Frequency**: Real-time countdown with second precision
- **Today Mode**: Switch to "Today is [Holiday Name]" when date arrives
- **Next Holiday**: Automatically advance to next holiday after current passes

### Long Weekend Calculation

- **Definition**: 3 or more consecutive days off (including weekends)
- **Display**: Clear visual indicators for long weekend holidays
- **Logic**: Account for weekend adjacency and multiple consecutive holidays

### Timezone Handling

- **Primary**: All times calculated in Philippine Standard Time (UTC+8)
- **User Notice**: Clear indication that times are Philippine-based
- **Consistency**: Maintain timezone accuracy across all features

## 7. Performance & Quality Standards

### Performance Targets

- **Load Time**: LCP ≤ 1.0s on mobile 4G
- **Layout Stability**: CLS ≤ 0.05 (including ads)
- **Availability**: 99.99% uptime SLO
- **Mobile Performance**: Lighthouse score ≥ 95

### Accessibility Requirements

- **Standard**: WCAG 2.2 AA compliance
- **Screen Readers**: Full compatibility with assistive technology
- **Keyboard Navigation**: Complete functionality without mouse
- **Live Updates**: ARIA-live regions for countdown changes

### Localization Standards

- **Languages**: English and Taglish (Filipino-English mix)
- **Date Format**: Philippine standard date formatting
- **Cultural Context**: Appropriate cultural references and terminology

## 8. SEO & Discovery

### Search Optimization

- **Static Routes**: SEO-friendly URLs for all major pages
- **Structured Data**: JSON-LD markup for holiday information
- **Meta Tags**: Optimized titles and descriptions
- **Social Sharing**: Open Graph and Twitter Card support

### Content Strategy

- **Authority**: Position as definitive Philippine holiday source
- **Keywords**: Target holiday-related search terms
- **Freshness**: Regular content updates signal relevancy

## 9. Monetization Strategy

### Advertising Integration

- **Ad Placement**: Below-the-fold, non-intrusive positioning
- **Performance Impact**: Zero CLS from ad loading
- **User Experience**: Minimal disruption to core functionality
- **Load Strategy**: Lazy loading for ads outside viewport

## 10. Success Metrics & KPIs

### User Engagement

- **Daily Active Users**: Track repeat usage patterns
- **Session Duration**: Average time spent on site
- **Page Views per Session**: Depth of engagement
- **Bounce Rate**: <40% target for homepage

### Performance Metrics

- **Core Web Vitals**: LCP, FID, CLS within Google thresholds
- **Mobile Performance**: Lighthouse score ≥95
- **Uptime**: 99.99% availability
- **Load Time**: <1.0s on mobile 4G

### Business Metrics

- **Ad Revenue**: Monthly revenue per user
- **Click-through Rate**: Ad engagement without user disruption
- **Organic Traffic**: SEO-driven discovery growth
- **Social Shares**: Viral coefficient for holiday content

## 11. Acceptance Criteria

### Homepage Functionality

- **AC-1**: Countdown displays accurate time to next holiday in DD:HH:MM:SS format
- **AC-2**: "Today is [Holiday]" mode activates correctly at midnight PHT
- **AC-3**: Next holiday name and date prominently displayed
- **AC-4**: Top 3 upcoming holidays shown with correct data
- **AC-5**: Long weekend indicators appear when applicable

### Holidays Page Functionality

- **AC-6**: Complete yearly holiday table displays correctly
- **AC-7**: Table sorting works for all columns (date, name, type)
- **AC-8**: Year navigation switches between current and next year
- **AC-9**: Holiday type badges show correct classifications
- **AC-10**: Long weekend badges appear for 3+ day periods

### Technical Acceptance

- **AC-11**: Site loads in <1.0s on mobile 4G connection
- **AC-12**: Lighthouse score ≥95 for performance and accessibility
- **AC-13**: Zero Cumulative Layout Shift from ad loading
- **AC-14**: Full keyboard navigation functionality
- **AC-15**: Screen reader compatibility verified

### Data Quality

- **AC-16**: All holiday data matches official government sources
- **AC-17**: Timezone calculations accurate to Philippine Standard Time
- **AC-18**: Graceful error handling when API unavailable
- **AC-19**: Stale data indicators appear when data >24 hours old

## 12. Launch Strategy

### Soft Launch Phase

- **Target**: Limited user testing and feedback collection
- **Duration**: 2 weeks
- **Goals**: Validate core functionality and user experience

### Public Launch

- **Marketing**: Social media announcement, PR outreach
- **SEO**: Submit to search engines, optimize for holiday keywords
- **Monitoring**: Close performance and error tracking

### Post-Launch

- **Iteration**: Weekly feature improvements based on user feedback
- **Content**: Regular holiday data updates and accuracy verification
- **Growth**: Organic SEO optimization and social sharing features

---

_For current implementation progress, see `implementation_status.md`_  
_For technical setup and development info, see `README.md`_
