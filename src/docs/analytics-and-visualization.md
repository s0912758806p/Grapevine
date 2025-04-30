# Analytics & Data Visualization Features

This document describes the client-side analytics and data visualization features implemented in the Grapevine project.

## Overview

The analytics and data visualization features provide users with insights about their browsing habits, content preferences, and interaction patterns. All data is stored locally in the browser using localStorage and is not sent to any server.

## Features

### 1. Analytics Service

The `analyticsService.ts` provides functions for:

- Recording content views
- Tracking reading time
- Storing search queries
- Analyzing tag interactions
- Generating usage statistics

### 2. Analytics Dashboard

The analytics dashboard `/analytics` displays:

- Content viewing statistics
- Reading time metrics
- Activity patterns by day of week
- Most viewed content
- Most interacted tags
- Browsing history
- Recent searches

## Data Storage

All analytics data is stored in the browser's localStorage under the key `grapevine_analytics`. The data structure includes:

```typescript
interface AnalyticsData {
  viewHistory: ViewRecord[]; // Record of viewed content
  mostViewed: Record<number, number>; // Issue number to view count
  readingTimeTotal: number; // Total reading time in seconds
  lastActive: number; // Last activity timestamp
  tagsInteracted: Record<string, number>; // Tag name to interaction count
  searchQueries: string[]; // Recent search queries
}
```

## Data Collection Points

Analytics data is collected at the following points:

1. **Content Views**: When viewing issue details in:

   - `IssueDetail.tsx`
   - `F2EIssueDetail.tsx`
   - `RepositoryIssueDetail.tsx`

2. **Search Queries**: When performing searches in:
   - `SearchAndFilter.tsx`

## Visualization Components

The dashboard uses several visualization methods:

1. **Statistics Cards**: For key metrics
2. **Bar Charts**: For activity by day and content source
3. **Tag Cloud**: For visualizing tag interactions
4. **Timeline**: For browsing history

## Privacy Considerations

- All data is stored locally and not transmitted
- Users can clear their analytics data at any time
- No personally identifiable information is stored

## Future Enhancements

Possible future enhancements include:

1. Data export functionality
2. More advanced visualizations
3. Reading time predictions
4. Content recommendations based on viewing patterns
5. More detailed tag analysis
