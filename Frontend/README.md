# Frontend

The Frontend directory contains the Angular-based web application that serves as the user interface for AnnotAIx. Built with modern web technologies and managed through Nx monorepo tooling, it provides an intuitive, responsive platform for AI-powered image analysis and interactive Q&A.

## Architecture Overview

The frontend application is built with:

- **Angular 17+**: Modern component-based framework with TypeScript
- **Nx Monorepo**: Advanced build system with computation caching
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Server-Side Rendering**: Enhanced performance and SEO capabilities
- **Jest Testing**: Comprehensive unit and integration testing
- **Proxy Configuration**: Seamless backend API integration

## Project Structure

```
Frontend/
├── project.json              # Nx project configuration
├── nx.json                   # Nx workspace configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript root configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.server.json      # SSR TypeScript config
├── tsconfig.spec.json        # Test TypeScript config
├── tailwind.config.js        # Tailwind CSS configuration
├── jest.config.ts            # Jest testing configuration
├── proxy.conf.json           # Development proxy settings
├── vercel.json               # Vercel deployment config
├── eslint.config.cjs         # ESLint configuration
├── public/                   # Static assets
└── src/
    ├── index.html            # Entry HTML template
    ├── main.ts               # Application bootstrap
    ├── main.server.ts        # SSR bootstrap
    ├── server.ts             # Express SSR server
    ├── styles.scss           # Global styles
    ├── mytheme-2.ts          # Custom Material theme
    └── app/
        ├── app.component.ts  # Root component
        ├── app.config.ts     # App configuration
        ├── app.routes.ts     # Route definitions
        └── ...               # Feature modules and components
```

## Key Features

### Responsive Design

Built with a mobile-first approach using Tailwind CSS:

- Adaptive layouts for all screen sizes
- Touch-optimized interactions
- Responsive images and media
- Flexible grid systems
- Breakpoint-based styling

### Component Architecture

Angular components provide modular, reusable UI elements:

- Smart/Container components for business logic
- Presentational components for UI rendering
- Shared components for common functionality
- Lazy-loaded feature modules for performance
- Route-based code splitting

### Server-Side Rendering (SSR)

Enhanced performance and SEO through Angular Universal:

- Faster initial page load
- Improved search engine indexing
- Better social media sharing previews
- Progressive enhancement support
- Hydration for seamless client takeover

### State Management

Efficient data flow and application state:

- Angular services for shared state
- RxJS observables for reactive programming
- Component lifecycle hooks for local state
- Route state management
- Form state handling with reactive forms

### API Integration

Seamless communication with the backend:

- HTTP client for REST API calls
- Proxy configuration for development
- Error handling and retry logic
- Request/response interceptors
- Real-time updates with streaming support

### Theming and Customization

Flexible styling system:

- Custom Material Design theme in `mytheme-2.ts`
- Tailwind utility classes for rapid styling
- SCSS for complex component styles
- CSS variables for dynamic theming
- Dark mode support (if implemented)

### Testing Infrastructure

Comprehensive testing with Jest:

- Unit tests for components and services
- Integration tests for feature modules
- Test utilities and mocks
- Coverage reporting
- Snapshot testing for UI consistency

## Setup and Installation

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git for version control

### Installation Steps

1. Navigate to the Frontend directory:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (if needed):

Create `src/environments/environment.ts` and `src/environments/environment.prod.ts`

## Development Workflow

### Development Server

Start the development server with hot-reload:

```bash
npx nx serve Frontend
```

The application will be available at `http://localhost:4200`

### Development with Backend Proxy

The `proxy.conf.json` file routes API requests to the backend:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Building for Production

Create an optimized production build:

```bash
npx nx build Frontend
```

Build output will be in `dist/Frontend/browser/`

### Server-Side Rendering Build

Build for SSR deployment:

```bash
npx nx build Frontend --configuration=production
npx nx server Frontend
```

### Running Tests

Execute unit tests with Jest:

```bash
npx nx test Frontend
```

Run tests with coverage:

```bash
npx nx test Frontend --coverage
```

Watch mode for development:

```bash
npx nx test Frontend --watch
```

### Linting

Check code quality with ESLint:

```bash
npx nx lint Frontend
```

Auto-fix issues:

```bash
npx nx lint Frontend --fix
```

## Configuration Files

### nx.json

Workspace-level Nx configuration:

- Task pipelines and caching
- Affected command settings
- Default project configurations
- Workspace layout

### project.json

Project-specific build targets:

- Build configurations
- Serve options
- Test settings
- Lint rules
- Custom executors

## Deployment

### Vercel Deployment

Automatic deployment with Vercel:

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npx nx build Frontend --prod`
   - Output Directory: `dist/Frontend/browser`
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main branch
