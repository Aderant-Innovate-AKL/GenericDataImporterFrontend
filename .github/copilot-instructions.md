# GitHub Copilot Instructions for Hackathon UI Template

## Project Overview

This is a **hackathon-ready template** for building React applications fast. It comes with everything you need pre-configured so you can focus on building features, not setup.

**Key Feature**: Works immediately without a backend - uses mock user by default.

## Technology Stack

- **React**: v19 (latest)
- **TypeScript**: v5.7+
- **Package Manager**: pnpm v10.0.0
- **Build Tool**: Vite v6+
- **UI Framework**: Material-UI (MUI) v7
- **Routing**: React Router v7
- **State Management**: TanStack Query v5
- **HTTP Client**: Axios
- **Testing**: Vitest + Playwright
- **Styling**: Emotion (via MUI)

## Quick Start Philosophy

Speed is key for hackathons. This template:
- **No backend required** - mock user works out of the box
- **No complex setup** - `pnpm install && pnpm dev` and you're running (requires GITHUB_TOKEN for private packages)
- **No authentication hassle** - mock user provided by default
- **Optional API integration** - add backend when ready

### Private Package Authentication

This template uses private `@aderant` packages from GitHub Packages. For local development:

```bash
# Set GitHub token with read:packages scope
export GITHUB_TOKEN=ghp_your_token_here

# Then install and run
pnpm install
pnpm dev
```

The `.npmrc` file is already configured to use this environment variable.

## Styling Rules

1. **Use MUI's `sx` prop** for styling - no inline styles
2. **Use theme values** - colors, spacing from theme
3. **Keep it simple** - use MUI components as-is when possible

### Good Styling Pattern

```tsx
import { Box, Typography, Button } from '@mui/material';

export default function MyComponent() {
  return (
    <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
      <Typography variant="h4" gutterBottom>
        Title
      </Typography>
      <Button variant="contained" color="primary">
        Click Me
      </Button>
    </Box>
  );
}
```

## React 19 Patterns

### Components

```tsx
// ✅ CORRECT - Function component with typed props
export default function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}

// ✅ CORRECT - Named export with interface
interface MyComponentProps {
  title: string;
  children: ReactNode;
}

export function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div>
      {title}
      {children}
    </div>
  );
}

// ❌ AVOID - React.FC is deprecated
export const MyComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

### Key React 19 Updates

- Component return types are inferred (no explicit annotation)
- Use plain functions, not `React.FC`
- Named imports from 'react': `import { useState } from 'react'`

## Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/         # React contexts (includes UserProvider with mock user)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── utils/           # Utilities and constants
│   ├── apiClient.ts # Axios instance
│   ├── constants.ts # Routes, endpoints, app metadata
│   └── config.ts    # Runtime config
├── App.tsx          # Main layout
└── main.tsx         # Entry point
```

## Development Commands

```bash
pnpm dev             # Start dev server (http://localhost:3000)
pnpm build          # Build for production
pnpm test           # Run tests
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Check code quality
pnpm format         # Format code
```

## Mock User (Default)

The app works without a backend by providing a mock user. Customize in three ways:

**1. Environment Variables** (in `.env.development`):
```bash
UI_MOCK_USER_FIRST_NAME=John
UI_MOCK_USER_LAST_NAME=Doe
UI_MOCK_USER_EMAIL=john@example.com
```

**2. Edit Mock User**:
Edit `src/mocks/mockUser.ts` to change defaults.

**3. Use Simplified Type** (recommended for hackathons):
```typescript
import { HackathonUser, toHackathonUser } from 'src/contexts';

// Simple interface - just id, email, name
const user: HackathonUser = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe'
};

// Convert to/from full UserType if needed
const fullUser = toUserType(user);
const simpleUser = toHackathonUser(fullUser);
```

## Adding a Backend API (Optional)

When you're ready to connect a real backend:

1. **Set environment variable**:
   ```bash
   cp .env.example .env.development
   # Edit .env.development
   UI_API_BASE_URL=http://localhost:8000
   ```

2. **Add endpoints** in `src/utils/constants.ts`:
   ```typescript
   export const API_ENDPOINTS = {
     MY_DATA: '/api/data',
     CREATE_ITEM: '/api/items',
   };
   ```

3. **Use with TanStack Query**:
   ```tsx
   import { useQuery } from '@tanstack/react-query';
   import { apiClient } from 'src/utils/apiClient';

   export function useMyData() {
     return useQuery({
       queryKey: ['myData'],
       queryFn: async () => {
         const { data } = await apiClient.get('/api/data');
         return data;
       },
     });
   }
   ```

## Common MUI Components

### Layout
- `Box` - Flexible container
- `Stack` - Vertical/horizontal layout
- `Grid2` - Grid layout (new in MUI v7)
- `Container` - Centered content wrapper

### Typography
- `Typography` with variants: h1-h6, body1-body2, caption, etc.

### Forms
- `TextField` - Text input
- `Button` - Buttons
- `Select` - Dropdowns
- `Checkbox`, `Switch` - Toggles

### Feedback
- `Alert` - Notifications
- `Dialog` - Modals
- `Snackbar` - Toast messages
- `CircularProgress` - Loading spinner

## Creating a New Page

```tsx
import { Box, Typography, Button } from '@mui/material';

export default function MyPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Page Title
      </Typography>
      <Typography variant="body1" paragraph>
        Page content goes here.
      </Typography>
      <Button variant="contained">
        Action Button
      </Button>
    </Box>
  );
}
```

Then add route in `src/main.tsx` and navigation in `src/App.tsx`.

## Navigation Setup

Update `navConfig` in `src/App.tsx`:

```tsx
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';

const navConfig = [
  {
    segment: 'home',
    title: 'Home',
    icon: <DashboardOutlined />,
  },
  {
    segment: 'settings',
    title: 'Settings',
    icon: <SettingsOutlined />,
  },
];
```

## Using the User Context

```tsx
import { useUser } from 'src/contexts';

export default function MyComponent() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome, {user.spec.firstName}!</div>;
}
```

## API Client (Axios)

Pre-configured axios instance available:

```tsx
import { apiClient } from 'src/utils/apiClient';

// GET request
const { data } = await apiClient.get('/api/endpoint');

// POST request
const { data } = await apiClient.post('/api/endpoint', { payload });

// PUT request
const { data } = await apiClient.put('/api/endpoint/123', { updates });

// DELETE request
await apiClient.delete('/api/endpoint/123');
```

## Constants Organization

Keep all constants in `src/utils/constants.ts`:

```typescript
export const ROUTES = {
  HOME: '/home',
  SETTINGS: '/settings',
};

export const API_ENDPOINTS = {
  MY_DATA: '/api/data',
};

export const APP_METADATA = {
  TITLE: 'My Hackathon App',
  DESCRIPTION: 'Built at Hackathon 2025',
};
```

## Environment Variables

All browser-accessible env vars must be prefixed with `UI_`:

```bash
# .env.development
UI_API_BASE_URL=http://localhost:8000
UI_FEATURE_FLAG=true
```

Access in code:

```tsx
const apiUrl = import.meta.env.UI_API_BASE_URL;
```

## Testing Patterns

### Component Test

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Hackathon Tips

### Speed Over Perfection
- Use MUI components directly - don't over-abstract
- Mock data in components if backend isn't ready
- Write minimal tests - focus on working features
- Use `console.log` for debugging - it's fast

### Keep It Simple
- Avoid complex state management patterns
- Use TanStack Query for server data, `useState` for UI state
- Don't worry about performance optimization initially
- Get it working, then refine

### Leverage What's Included
- Stridyn components are available if needed (`@aderant/stridyn-*`)
- MUI has components for almost everything
- TanStack Query handles caching automatically
- TypeScript helps catch bugs early

## Common Pitfalls

1. ❌ Don't use inline styles - use `sx` prop
2. ❌ Don't use npm/yarn - use pnpm
3. ❌ Don't use `React.FC` - plain functions
4. ❌ Don't overcomplicate - keep it simple for hackathons

## Package Management

**Always use pnpm**:

```bash
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency
pnpm remove <package>     # Remove package
pnpm install             # Install all
```

## Deployment to AWS

The template includes automated AWS deployment using AWS Copilot.

### Key Files

- **`Dockerfile`** - Multi-stage build for Vite app (deps → build → nginx)
- **`.github/workflows/deploy.yaml`** - GitHub Actions workflow for automated deployment

### Deployment Workflow

The GitHub Actions workflow:
1. **Prepare** job: Discovers Copilot app, environments, and services
2. **env-deploy** job: Deploys all environments in parallel
3. **svc-deploy** job: Deploys services to environments (cross-product matrix)

Triggers:
- Automatically on push to `main`
- Manually via workflow_dispatch

### Required GitHub Secrets

Users must configure in repository settings (Settings → Secrets and variables → Actions):

**Variables:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_REGION` - AWS region (typically `us-east-1`)
- `DOCKER_USERNAME` - Docker Hub username (optional, for rate limits)

**Secrets:**
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `DOCKER_PASSWORD` - Docker Hub password (optional, for rate limits)
- `GITHUB_TOKEN` - GitHub personal access token with `read:packages` scope (required for @aderant private packages)

**Note:** The `GITHUB_TOKEN` is passed to Docker during build to authenticate with GitHub Packages for installing `@aderant` scoped packages.

### User Setup Steps

After cloning the template, users need to:

1. Install AWS Copilot CLI:
   ```bash
   brew install aws/tap/copilot-cli  # macOS
   ```

2. Initialize application:
   ```bash
   copilot app init hackathon-ui-template
   ```

3. Create environment:
   ```bash
   copilot env init --name dev --region us-east-1 --default-config
   ```

4. Create service:
   ```bash
   copilot svc init
   # Choose: Load Balanced Web Service
   # Name: frontend
   # Dockerfile: ./Dockerfile
   ```

5. Update service manifest (network binding + private package auth):
   ```bash
   find copilot -type f -name manifest.yml -not -path "*/environments/*" -print0 | \
   while IFS= read -r -d '' file; do
     yq -i '.variables.HOST = "0.0.0.0" | .variables.HOSTNAME = "0.0.0.0" | .image.build.args.GITHUB_TOKEN = "${GITHUB_TOKEN}"' "$file"
   done
   ```

   The manifest should include:
   ```yaml
   image:
     build:
       args:
         GITHUB_TOKEN: ${GITHUB_TOKEN}
   variables:
     HOST: "0.0.0.0"
     HOSTNAME: "0.0.0.0"
   ```

6. Commit copilot configuration:
   ```bash
   git add copilot/
   git commit -m "Add Copilot configuration"
   ```

7. Configure GitHub repository secrets (listed above)

8. Push to main to deploy:
   ```bash
   git push origin main
   ```

### Manual Deployment

```bash
copilot svc deploy --name frontend --env dev
```

### Useful Commands

```bash
copilot app show                        # View application status
copilot svc ls                          # List services
copilot svc show --name frontend        # View service details + URL
copilot svc logs --name frontend --follow  # View live logs
```

### Dockerfile Structure

The Dockerfile uses a 3-stage build optimized for Vite apps:

1. **deps stage**: Installs pnpm and dependencies
   - Accepts `GITHUB_TOKEN` build arg for private package authentication
   - Copies `.npmrc` to configure @aderant package registry
   - Installs dependencies and cleans up `.npmrc` for security
2. **builder stage**: Builds the Vite app (`pnpm build`)
3. **runner stage**: Serves built files with nginx on port 80

Key features:
- Private package authentication via `.npmrc` and `GITHUB_TOKEN`
- nginx with SPA routing (`try_files` for client-side routes)
- Gzip compression enabled
- Static asset caching (1 year)
- Security headers
- Health check endpoint

**Important:** The `.npmrc` file configures authentication for `@aderant` scoped packages hosted on GitHub Packages. It requires a `GITHUB_TOKEN` with `read:packages` permission.

### Deployment Architecture

AWS Copilot automatically creates:
- **ECS cluster** with Fargate tasks
- **Application Load Balancer** for HTTP/HTTPS traffic
- **ECR repository** for Docker images
- **VPC, subnets, security groups** for networking
- **CloudWatch Logs** for application logs
- **IAM roles** with proper permissions

All infrastructure managed via CloudFormation stacks.

## Resources

- [React Docs](https://react.dev/)
- [MUI Documentation](https://mui.com/)
- [TanStack Query](https://tanstack.com/query)
- [Vite Guide](https://vitejs.dev/)
- [MUI Icons](https://mui.com/material-ui/material-icons/)
- [AWS Copilot Docs](https://aws.github.io/copilot-cli/)

## Summary

This template is designed for **speed**. Everything works out of the box. No backend needed to start. Add features fast with pre-configured MUI, React 19, and TypeScript. Focus on building your idea, not setup.

**Get started**: `pnpm install && pnpm dev` 🚀
