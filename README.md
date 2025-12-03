# Your Hackathon Project

A React application built from the Hackathon UI Template with React 19, TypeScript, Vite,
and Material UI.

## Getting Started

### Prerequisites

This project uses private `@aderant` packages that require authentication with GitHub
Packages.

**Create a GitHub Personal Access Token:**

1. Go to
   [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Generate new token with `read:packages` scope
3. Copy the token (starts with `ghp_`)
4. **Important:** Configure SSO - Click "Configure SSO" next to the token and authorize it
   for the `aderant` organization

**Set the token as an environment variable:**

```bash
export GHCR_READ_TOKEN=ghp_your_token_here
```

Or add it to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
echo 'export GHCR_READ_TOKEN=ghp_your_token_here' >> ~/.zshrc
source ~/.zshrc
```

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open `http://localhost:3000` and start building!

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Check code quality
- `pnpm format` - Format code

## Project Structure

```
src/
├── components/      # Reusable UI components
├── contexts/        # React contexts (includes mock user)
├── pages/          # Page components
├── utils/          # Utilities and constants
└── App.tsx         # Main app layout
```

## Customization

### App Title & Branding

Update `src/utils/constants.ts`:

```typescript
export const APP_METADATA = {
  TITLE: 'Your App Name',
  DESCRIPTION: 'Your Description',
};
```

### Navigation

Update navigation in `src/App.tsx`:

```typescript
const navConfig = [
  {
    segment: 'home',
    title: 'Home',
    icon: <DashboardOutlined />,
  },
  // Add your routes here
];
```

### Add a New Page

1. Create page in `src/pages/MyPage.tsx`
2. Add route in `src/main.tsx`
3. Add to navigation in `src/App.tsx`

## Connecting to a Backend API

By default, the app uses a mock user. To connect a real backend:

1. Copy `.env.example` to `.env.development`:

   ```bash
   cp .env.example .env.development
   ```

2. Set your API URL:

   ```bash
   UI_API_BASE_URL=http://localhost:8000
   ```

3. Add your API endpoints in `src/utils/constants.ts`

### Mock User Configuration

Without a backend, the app provides a mock user. Customize it in three ways:

**1. Environment Variables** (easiest):

```bash
# In .env.development
UI_MOCK_USER_FIRST_NAME=John
UI_MOCK_USER_LAST_NAME=Doe
UI_MOCK_USER_EMAIL=john@example.com
```

**2. Edit Mock User File**: Edit `src/mocks/mockUser.ts` to change the default mock user.

**3. Use Simplified Type**: For hackathons, use the simpler `HackathonUser` type instead
of full `UserType`:

```typescript
import { HackathonUser, toHackathonUser } from 'src/contexts';

const simpleUser: HackathonUser = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'John Doe',
};
```

## Deployment to AWS

This project is pre-configured for AWS deployment using GitHub Actions and AWS Copilot.
The deployment infrastructure is already set up in the `.github/workflows/` directory!

### Quick Deploy

To deploy your app, you only need to:

1. **Configure GitHub Secrets** (one-time setup)
2. **Push to main** - Automatic deployment via GitHub Actions
3. **Or deploy manually** using AWS Copilot CLI

### Configure GitHub Secrets

In your GitHub repository settings (Settings → Secrets and variables → Actions), add:

**Variables**:

- `AWS_ACCESS_KEY_ID` - Your AWS access key ID
- `AWS_REGION` - AWS region (e.g., `us-east-1`)
- `DOCKER_USERNAME` - Your Docker Hub username (optional, for rate limit)

**Secrets**:

- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key
- `DOCKER_PASSWORD` - Your Docker Hub password (optional, for rate limit)
- `GHCR_READ_TOKEN` - GitHub personal access token with `read:packages` permission (required
  for @aderant packages)

**Creating a GitHub Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `read:packages` scope
3. Configure SSO and authorize for the `aderant` organization
4. Copy the token and add it as a repository secret named `GHCR_READ_TOKEN`

### Automated Deployment

Once secrets are configured, deployment is automatic:

```bash
git push origin main
```

Monitor progress in the **Actions** tab of your GitHub repository. The workflow will:

1. Build your Docker image
2. Push to Amazon ECR
3. Deploy to AWS using Copilot
4. Display the service URL when complete

### Manual Deployment

If you prefer to deploy manually, install AWS Copilot CLI:

**macOS:**

```bash
brew install aws/tap/copilot-cli
```

**Linux:**

```bash
curl -Lo copilot https://github.com/aws/copilot-cli/releases/latest/download/copilot-darwin
chmod +x copilot
sudo mv copilot /usr/local/bin/copilot
```

**Configure AWS credentials** (Option A: Profile or Option B: Environment Variables):

```bash
# Option A: In ~/.aws/credentials
[your-profile-name]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
region = us-east-1

# Option B: Environment Variables
export AWS_DEFAULT_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
```

**Deploy:**

```bash
copilot svc deploy --name frontend --env dev
```

### Useful Commands

View application status:

```bash
copilot app show
```

View service details and URL:

```bash
copilot svc show --name frontend
```

View live logs:

```bash
copilot svc logs --name frontend --env dev --follow
```

### Troubleshooting

**"Credentials expired" error:** AWS temporary credentials expire. Refresh them and try
again.

**Service won't deploy:** Check CloudWatch Logs:

```bash
copilot svc logs --name frontend --env dev
```

**GitHub Actions failing:** Verify repository secrets are correctly configured.

### What's Already Configured

This template includes:

- **GitHub Actions workflows** (`.github/workflows/` directory):
  - `deploy.yaml` - Automated deployment pipeline that:
    - Discovers AWS Copilot apps, environments, and services
    - Deploys environments in parallel
    - Deploys services to all environments
    - Triggers on push to `main` or manual workflow dispatch
  - `lint-and-test.yaml` - Code quality and testing checks
- **Dockerfile** - Multi-stage build optimized for production with:
  - Private package authentication (`GHCR_READ_TOKEN`)
  - Production-ready nginx configuration
  - Port 80 exposure

When you run the deployment, AWS Copilot automatically provisions:

- **Amazon ECS** - Container orchestration
- **AWS Fargate** - Serverless compute
- **Application Load Balancer** - Traffic distribution
- **Amazon ECR** - Docker image registry
- **VPC & Security Groups** - Network infrastructure
- **CloudWatch Logs** - Application logging
- **IAM Roles** - Proper AWS permissions

## Tips

- 💡 Check [MUI docs](https://mui.com/) for component examples
- 💡 Use `sx` prop for styling (no inline styles)
- 💡 Keep constants in `src/utils/constants.ts`
- 💡 Run `pnpm test:watch` while developing

## Need Help?

- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [MUI Docs](https://mui.com/)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

## About This Template

This project was created from the
[Hackathon UI Template](https://github.com/aderant-innovate/hackathon-ui-template). Below
is information about what's included in the template.

### What's Included

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Material UI (MUI)** for components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Vitest** for unit testing
- **Playwright** for e2e testing
- **ESLint & Prettier** for code quality
- **Husky** for git hooks
- **AWS Copilot** deployment configuration
- **GitHub Actions** CI/CD workflow

### Tech Stack Details

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI) with Emotion
- **Routing**: React Router v7
- **State Management**: TanStack Query for server state
- **HTTP Client**: Axios
- **Testing**: Vitest (unit), Playwright (e2e)
- **Code Quality**: ESLint, Prettier, Husky
- **Deployment**: AWS Copilot, GitHub Actions

### Pre-installed Components

- **Error Boundary**: Error fallback component for graceful error handling
- **Loading Spinner**: Reusable loading indicator
- **User Context**: Mock user authentication context for development
- **API Client**: Pre-configured Axios instance with interceptors
- **Utilities**: Common utilities for dates, formatting, validation, and styling

### How AWS Deployment Was Configured

The template includes pre-configured AWS deployment. Here's how it was originally set up
(you don't need to do this):

#### 1. GitHub Actions Workflow

A deployment workflow was created at `.github/workflows/deploy.yaml` that:

- Triggers on push to `main` or manual workflow dispatch
- Installs AWS Copilot CLI and dependencies (jq)
- Discovers the Copilot app name from `copilot/.workspace`
- Lists all environments and services using `copilot env ls` and `copilot svc ls`
- Builds a deployment matrix (cross-product of environments × services)
- Deploys environments in parallel (Phase 1)
- Deploys services to all environments (Phase 2)
- Authenticates with AWS using GitHub secrets
- Passes `GHCR_READ_TOKEN` to Docker builds for private package access

The workflow is fully dynamic - it automatically detects all Copilot environments and
services, so you can add new ones without modifying the workflow.

#### 2. AWS Copilot Initialization

AWS Copilot was used to create the initial infrastructure configuration:

```bash
# Initialize Copilot application
copilot app init hackathon-ui-template

# Create development environment
copilot env init --name dev --region us-east-1 --default-config

# Create service
copilot svc init
# Selected: Load Balanced Web Service
# Service name: frontend
# Dockerfile: ./Dockerfile
# Port: 80
```

This created the `copilot/` directory with:

- `.workspace` - Application metadata
- `environments/` - Environment configurations
- `frontend/manifest.yml` - Service configuration

#### 3. Service Manifest Configuration

The `copilot/frontend/manifest.yml` was configured with:

```yaml
image:
  build:
    dockerfile: Dockerfile
    args:
      GHCR_READ_TOKEN: ${GHCR_READ_TOKEN} # For private @aderant packages

variables:
  HOST: '0.0.0.0' # Network binding
  HOSTNAME: '0.0.0.0' # Network binding
```

This was done using `yq`:

```bash
find copilot -type f -name manifest.yml -not -path "*/environments/*" -print0 | \
while IFS= read -r -d '' file; do
  yq -i '
    .variables.HOST = "0.0.0.0" |
    .variables.HOSTNAME = "0.0.0.0" |
    .image.build.args.GHCR_READ_TOKEN = "${GHCR_READ_TOKEN}"
  ' "$file"
done
```

#### 4. Dockerfile

A multi-stage Dockerfile was created that:

- Uses Node.js for building
- Accepts `GHCR_READ_TOKEN` as a build argument
- Authenticates with GitHub Packages for private `@aderant` packages
- Builds the production bundle with Vite
- Uses nginx for serving static files
- Exposes port 80

#### 5. Additional Workflow

A `lint-and-test.yaml` workflow was added for continuous integration:

- Runs ESLint for code quality
- Executes Vitest unit tests
- Runs on pull requests and pushes

All of this configuration is already in your repository, so you just need to add GitHub
secrets and push to deploy!

Happy hacking! 🚀
