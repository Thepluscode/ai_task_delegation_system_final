# Deployment Guide

This guide covers deploying the AI Automation Platform frontend to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Build Process](#build-process)
- [Deployment Options](#deployment-options)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [Docker](#docker)
  - [AWS](#aws)
  - [Self-hosted](#self-hosted)
- [Post-deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18.0.0 or later
- npm 8.0.0 or later
- Backend API running and accessible
- Environment variables configured

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Application
NEXT_PUBLIC_APP_NAME="AI Automation Platform"
NEXT_PUBLIC_APP_URL="https://your-domain.com"

# API Configuration
BACKEND_URL="https://api.your-domain.com"
NEXT_PUBLIC_API_URL="https://api.your-domain.com/api/v1"
NEXT_PUBLIC_WS_URL="wss://api.your-domain.com/ws"

# Authentication
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
JWT_SECRET="your-jwt-secret"

# Database (if needed)
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Redis
REDIS_URL="redis://your-redis-host:6379"

# AI Services
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
GOOGLE_ANALYTICS_ID="your-ga-id"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"
```

## Build Process

1. **Install dependencies**:
   ```bash
   npm ci
   ```

2. **Run type checking**:
   ```bash
   npm run type-check
   ```

3. **Run linting**:
   ```bash
   npm run lint
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Build the application**:
   ```bash
   npm run build
   ```

6. **Test the build locally**:
   ```bash
   npm start
   ```

## Deployment Options

### Vercel

Vercel is the recommended platform for Next.js applications.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in the Vercel dashboard.

4. **Set up custom domain** (optional).

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Netlify

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment variables**: Configure in Netlify dashboard.

3. **Redirects**: Create `_redirects` file:
   ```
   /api/* https://api.your-domain.com/api/:splat 200
   /* /index.html 200
   ```

### Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup -g 1001 -S nodejs
   RUN adduser -S nextjs -u 1001
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t automation-ai-next .
   docker run -p 3000:3000 automation-ai-next
   ```

### AWS

#### Using AWS Amplify

1. **Connect repository** to AWS Amplify.

2. **Build settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

#### Using EC2

1. **Launch EC2 instance** with Node.js.

2. **Install dependencies**:
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm
   ```

3. **Deploy application**:
   ```bash
   git clone your-repo
   cd automation-ai-next
   npm ci
   npm run build
   npm start
   ```

4. **Set up reverse proxy** with Nginx:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Self-hosted

1. **Server requirements**:
   - Node.js 18+
   - PM2 for process management
   - Nginx for reverse proxy
   - SSL certificate

2. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

3. **Create ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'automation-ai-next',
       script: 'npm',
       args: 'start',
       cwd: '/path/to/app',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

4. **Deploy with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Post-deployment

### Health Checks

1. **Application health**:
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Performance monitoring**:
   - Set up Sentry for error tracking
   - Configure Google Analytics
   - Monitor Core Web Vitals

### Security

1. **SSL/TLS**: Ensure HTTPS is enabled.

2. **Security headers**: Verify security headers are set.

3. **Content Security Policy**: Configure CSP headers.

### Monitoring

1. **Uptime monitoring**: Set up monitoring services.

2. **Performance monitoring**: Use tools like Lighthouse CI.

3. **Error tracking**: Configure Sentry or similar service.

## Troubleshooting

### Common Issues

1. **Build failures**:
   - Check Node.js version compatibility
   - Verify environment variables
   - Review build logs for specific errors

2. **Runtime errors**:
   - Check API connectivity
   - Verify environment variables
   - Review application logs

3. **Performance issues**:
   - Optimize images and assets
   - Enable compression
   - Use CDN for static assets

### Debug Commands

```bash
# Check build output
npm run build -- --debug

# Analyze bundle size
npm run analyze

# Check for security vulnerabilities
npm audit

# Test production build locally
npm run build && npm start
```

### Support

For deployment issues:

1. Check the [troubleshooting guide](./TROUBLESHOOTING.md)
2. Review application logs
3. Contact the development team
4. Create an issue in the repository

## Performance Optimization

### Build Optimization

1. **Bundle analysis**:
   ```bash
   npm run analyze
   ```

2. **Image optimization**: Use Next.js Image component.

3. **Code splitting**: Implement dynamic imports.

### Runtime Optimization

1. **Caching**: Configure appropriate cache headers.

2. **CDN**: Use CDN for static assets.

3. **Compression**: Enable gzip/brotli compression.

## Rollback Strategy

1. **Version tagging**: Tag releases for easy rollback.

2. **Blue-green deployment**: Maintain two production environments.

3. **Database migrations**: Ensure backward compatibility.

4. **Monitoring**: Set up alerts for deployment issues.
