# Local Data Setup

This project now supports using local holiday data instead of backend API calls when the backend is not available.

## How to Use

### Option 1: Environment Variable (Recommended)

Set the `USE_LOCAL_DATA` environment variable to `true`:

```bash
# For development
USE_LOCAL_DATA=true npm run dev

# For building
USE_LOCAL_DATA=true npm run build
```

### Option 2: Create .env file

Create a `.env` file in the project root with:

```env
USE_LOCAL_DATA=true
```

## How It Works

1. When `USE_LOCAL_DATA=true`, the application will load holiday data from `official_data.json` instead of making API calls
2. The local data includes holidays for 2025 and 2026
3. The system automatically finds the next upcoming holidays and generates the same data structure as the API would provide
4. All existing functionality (countdown, visualizer, etc.) works exactly the same

## Data Source

The local data is stored in `official_data.json` and contains official Philippine holidays from the Official Gazette.

## Switching Back to API

To use the backend API again, simply remove the environment variable or set it to `false`:

```bash
USE_LOCAL_DATA=false npm run build
# or just
npm run build
```

## Technical Details

- The conditional logic is implemented in `src/lib/site-data.ts`
- Local data processing includes finding next holidays and formatting them to match API response
- The environment variable is configured in `astro.config.mjs`
- Both development and production builds support this feature
