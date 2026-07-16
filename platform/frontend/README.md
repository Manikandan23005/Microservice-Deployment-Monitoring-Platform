# Platform Frontend Client UI

## Overview
This is the client interface Single Page Application (SPA) codebase for the DevOps Nexus platform. It provides visual dashboard grids and real-time status details of deployments.

## Directory Layout
* `src/components/`: Reusable cards, grids, loading spinners, and table components.
* `src/layouts/`: Collapsible sidebars and top navigation headers.
* `src/pages/`: Main application routing view paths.
* `src/services/`: Local endpoints query client (`api.ts`).
* `src/types/`: TypeScript interface specs.
* `public/`: Index favicons and HTML references.

## Local Startup
To initialize the React client locally:
```bash
# Install dependencies
npm install

# Run the local server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

## Production Builds
Compile TypeScript definitions and build deployment assets:
```bash
npm run build
```
The compiled output is written to `/dist` directory.
