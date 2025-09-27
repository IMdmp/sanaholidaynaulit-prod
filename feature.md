# Feature Documentation: Long Weekend Visualizer Prototype

This document outlines the features of the "Long Weekend Visualizer," a conceptual prototype designed to enhance the user experience of the SanaHolidayNaUlit.com website.

## 1. Core Visualizer Features

### 1.1. Visual Calendar Display

Instead of a simple text-based list or a badge in a table, the prototype uses a familiar mini-calendar format to display holiday information. This provides immediate, intuitive context for users planning their schedules.

### 1.2. Clear Highlighting of Days

The calendar uses distinct colors and styles to differentiate between:

- **Weekends:** Standard non-working days (Saturday, Sunday).
- **Official Holidays:** Government-declared national holidays.
- **Long Weekend Range:** A visual connector that groups all consecutive days off (weekends + holidays) into a single, cohesive block.

### 1.3. Seamless Month-Spanning Logic

The visualizer correctly handles long weekends that span across month or year boundaries (e.g., the holiday period from late December to early January). It automatically displays calendars for all relevant months within the same holiday card, preventing user confusion.

## 2. Smart Holiday Suggestions

### 2.1. "Bridge" Holiday Identification

The system intelligently identifies official holidays that fall on a Tuesday or a Thursday.

### 2.2. Suggested Vacation Leave

When a "bridge" holiday is found, the prototype automatically highlights the adjacent Monday or Friday as a "suggested vacation leave." This proactive feature shows users how a single day of leave can result in a four-day weekend, directly addressing a core user need for vacation planning.

### 2.3. Clear Call to Action

Each suggested long weekend includes a clear, encouraging message (e.g., "Take 1 day off for a 4-day weekend!") to ensure the user understands the opportunity.

## 3. User Interface & Navigation

### 3.1. Dedicated Holiday Cards

Each long weekend event, whether official or suggested, is presented in its own distinct card. This modular approach keeps the interface clean and allows users to focus on one event at a time.

### 3.2. Sticky Sidebar Navigation

A fixed sidebar on the left provides a high-level overview of all available long weekends for the year. Each holiday is represented by a link corresponding to its start month and year.

### 3.3. Smooth Scroll-to-Section

Clicking a link in the sidebar smoothly scrolls the user directly to the corresponding holiday card, allowing for quick and effortless navigation to specific months.

### 3.4. Scroll-Spying for Context

As the user scrolls through the holiday cards, the corresponding link in the sidebar is automatically highlighted. This "scroll-spying" feature provides constant feedback, ensuring the user always knows which month's holiday they are currently viewing.
