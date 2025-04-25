# Grapevine Forum

Grapevine is a lightweight forum application with a Reddit-style interface, using local mock data to implement posts and comments functionality.

## Features

- Reddit-style user interface
- Post voting system (upvote/downvote)
- Complete post and comment system using local mock data
- Custom username support for posts and comments
- Tag categorization system for better content organization
- Fully responsive design for both mobile and desktop devices

## Quick Start

### Installation

1. Clone this repository

   ```
   git clone https://github.com/yourusername/grapevine.git
   cd grapevine
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Start the development server

   ```
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```
npm run build
```

The generated files will be in the `dist` folder.

## Usage Guide

### Browse Posts

The homepage displays a list of all posts. Click on any post to view its details and comments.

### Create a New Post

1. Click the "+" button in the navigation bar
2. Fill in your username (optional), title, and content
3. Optionally add custom tags
4. Click the "Post" button to publish

### Add Comments

1. Find the comment section at the bottom of the post detail page
2. Enter your username (optional)
3. Type your comment
4. Click the "Post Comment" button

## Project Structure

```
src/
├── api/
│   └── mockData.ts    # Mock data and API functions
├── components/
│   ├── AppLayout.tsx  # Application layout
│   ├── CommentSection.tsx # Comments component
│   ├── IssueDetail.tsx # Post detail
│   ├── IssueList.tsx  # Post listing
│   └── NewIssue.tsx   # New post creation
├── pages/
│   └── CommentsExample.tsx # Comment example page
├── store/
│   ├── commentsSlice.ts # Comment state management
│   ├── index.ts        # Redux store configuration
│   └── issuesSlice.ts  # Post state management
├── types/
│   └── index.ts        # TypeScript interfaces
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Ant Design 5
- **Routing**: React Router 6
- **Date Handling**: Dayjs
- **Build Tool**: Vite 6
- **Styling**: SASS

## Customization

### Adding More Mock Data

You can add, modify, or delete mock data in the `src/api/mockData.ts` file.

### Adjusting Interface Style

The main style settings are in the individual components, using Ant Design's styling system.

## Deployment

For deployment instructions, see the [DEPLOY.md](./DEPLOY.md) file.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Author

Gorman
