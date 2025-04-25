
# Grapevine

Grapevine is a modern forum application that integrates with GitHub issues to create a clean, collaborative discussion platform.

## Features

- GitHub integration - leverages GitHub issues as content source
- Dual content sources - displays both community discussions and F2E jobs
- Interactive comments via Utterances
- Clean, modern UI built with Ant Design
- Responsive design for all devices
- Post sharing capabilities
- Tag categorization system

## Quick Start

### Installation

1. Clone this repository

   ```
   git clone https://github.com/yourusername/Grapevine.git
   cd Grapevine
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up environment variables

   Create a `.env` file with:
   ```
   VITE_GITHUB_REPO_OWNER=your-github-username
   VITE_GITHUB_REPO_NAME=your-repo-name
   ```

4. Start the development server

   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

### Build for Production

```
npm run build
```

Generated files will be in the `dist` folder.

## Usage Guide

### Browse Issues and Discussions

The homepage displays tabs for F2E Jobs and Grapevine Community discussions. Click any item to view details and comments.

### Comments

The application uses Utterances for comments, allowing GitHub-based authentication and interactions directly in the interface.

## Project Structure

```
src/
├── api/
│   └── githubApi.ts     # GitHub API integration
├── components/
│   ├── AppLayout.tsx    # Main application layout
│   ├── AntConfigProvider.tsx # Ant Design theme configuration
│   ├── CommentSection.tsx    # Comments component
│   ├── IssueDetail.tsx       # Regular issue details
│   ├── F2EIssueDetail.tsx    # F2E job issue details
│   ├── HomePage.tsx          # Main page with tabs
│   ├── UtterancesComments.tsx # GitHub comments integration
├── pages/
│   └── CommentsExample.tsx   # Comment example page
├── store/
│   ├── commentsSlice.ts      # Comments state management
│   ├── githubIssuesSlice.ts  # GitHub issues state
│   ├── f2eIssuesSlice.ts     # F2E issues state
│   └── index.ts              # Redux store configuration
├── styles/
│   ├── markdown.scss         # Markdown styling
│   └── index.scss            # Global styles
└── types/
    └── index.ts              # TypeScript interfaces
```

## Technology Stack

- **Frontend Framework**: React
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Ant Design
- **Routing**: React Router
- **Data Fetching**: GitHub API
- **Comments**: Utterances
- **Build Tool**: Vite
- **Styling**: SCSS

## Configuration

### GitHub Integration

The application connects to GitHub repositories for:
1. Community discussions - Set via environment variables
2. F2E Jobs - Connects to f2etw/jobs repository

### Theme Customization

The Ant Design theme is configured in `src/components/AntConfigProvider.tsx`.

## License

This project is licensed under the MIT License.

## Author

Gorman