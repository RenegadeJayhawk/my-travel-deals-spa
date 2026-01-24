# Travel Deals SPA

[![CI](https://github.com/RenegadeJayhawk/my-travel-deals-spa/actions/workflows/ci.yml/badge.svg)](https://github.com/RenegadeJayhawk/my-travel-deals-spa/actions/workflows/ci.yml)

A modern single-page application for discovering and managing travel deals with advanced filtering, saved searches, and price alerts.

## Features

- **Deal Browsing** - Responsive grid layout with comprehensive deal information
- **Advanced Filtering** - Search by destination, price range, deal type, and travel dates
- **Saved Searches** - Bookmark filter configurations for quick access
- **Saved Deals** - Save individual deals with one click
- **Price Alerts** - Set price thresholds and receive notifications
- **URL State Management** - Share and bookmark searches via URL

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **React Router** for client-side routing
- **LocalStorage** for data persistence

### Backend
- **Cloudflare Workers** with Hono framework
- **D1 Database** for serverless SQL storage
- **RESTful API** with comprehensive filtering

### Testing
- **Vitest** for unit and integration tests
- **React Testing Library** for component tests
- **319 tests** with 100% pass rate

## Project Structure

```
my-travel-deals-spa/
├── apps/
│   ├── api/          # Cloudflare Workers API
│   └── client/       # React SPA
├── .github/
│   └── workflows/    # CI/CD configuration
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites
- Node.js 22.x
- pnpm 9.x

### Installation

```bash
# Install dependencies
pnpm install

# Start API server
cd apps/api
pnpm dev

# Start client (in another terminal)
cd apps/client
pnpm dev
```

The application will be available at `http://localhost:5173`

## Testing

```bash
# Run all tests
cd apps/client
pnpm test:run

# Run tests in watch mode
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui
```

## CI/CD

GitHub Actions automatically runs all tests on every push and pull request. The workflow:
- ✅ Runs all 319 tests
- ✅ Generates coverage reports
- ✅ Comments results on pull requests
- ✅ Caches dependencies for faster builds

## Test Coverage

- **Integration Tests:** 93 tests
- **Unit Tests (Services):** 63 tests
- **Integration Tests (Utils):** 30 tests
- **Component Tests:** 133 tests
- **Total:** 319 tests (100% pass rate)

## Development

### Available Scripts

**Client:**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests in watch mode
- `pnpm test:run` - Run tests once
- `pnpm test:ui` - Open test UI
- `pnpm test:coverage` - Generate coverage report

**API:**
- `pnpm dev` - Start Cloudflare Workers dev server
- `pnpm deploy` - Deploy to Cloudflare

## Deployment

### Frontend
The React SPA can be deployed to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.)

### Backend
The API is deployed to Cloudflare Workers:
```bash
cd apps/api
pnpm deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All pull requests must pass CI tests before merging.

## License

This project is private and proprietary.

## Project Status

**Overall Completion:** 75%

| Milestone | Status |
|:----------|:-------|
| M0: Project Foundations | ✅ 100% |
| M1: Backend Core & Data | ✅ 100% |
| M2: Frontend Deals Listing | ✅ 100% |
| M3: Filters & Search | ✅ 100% |
| M4: Saved Searches | ✅ 100% |
| M5: Price Alerts | ✅ 95% |
| Testing Infrastructure | ✅ 100% |
| Component Tests | ✅ 100% |
| CI/CD | ✅ 100% |

## Documentation

- [Milestone 4 Complete](./MILESTONE_4_COMPLETE.md)
- [Milestone 5 Complete](./MILESTONE_5_COMPLETE.md)
- [Milestone 5 Polish Complete](./MILESTONE_5_POLISH_COMPLETE.md)
- [Saved Deals Complete](./SAVED_DEALS_COMPLETE.md)
- [URL State Complete](./URL_STATE_COMPLETE.md)
- [Testing Infrastructure Complete](./TESTING_INFRASTRUCTURE_COMPLETE.md)
- [Component Tests Complete](./COMPONENT_TESTS_COMPLETE.md)
- [Timer Tests Fix Complete](./TIMER_TESTS_FIX_COMPLETE.md)

