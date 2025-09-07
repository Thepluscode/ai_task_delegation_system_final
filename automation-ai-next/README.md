# Automation AI Next.js Frontend

A modern, responsive Next.js frontend for the AI Automation Platform, providing comprehensive management interfaces for workflows, robots, AI models, and task delegation.

## ✨ Features

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Seamless theme switching
- **Component Library**: Reusable UI components with consistent design
- **Accessibility**: WCAG 2.1 compliant interface

### 🚀 Performance
- **Next.js 14**: Latest App Router with server components
- **Optimized Loading**: Lazy loading and code splitting
- **Caching Strategy**: SWR for efficient data fetching
- **Image Optimization**: Next.js Image component with WebP support

### 🔧 Developer Experience
- **TypeScript**: Full type safety
- **ESLint & Prettier**: Code quality and formatting
- **Storybook**: Component documentation and testing
- **Jest Testing**: Comprehensive test suite

## 🏗️ Architecture

```
automation-ai-next/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Dashboard pages
│   ├── workflows/          # Workflow management
│   ├── robots/             # Robot control and monitoring
│   ├── ai/                 # AI model management
│   ├── tasks/              # Task management
│   └── api/                # API routes
├── components/             # Reusable components
│   ├── ui/                 # Basic UI components
│   ├── layout/             # Layout components
│   ├── dashboard/          # Dashboard-specific components
│   ├── workflow/           # Workflow designer components
│   └── robot/              # Robot control components
├── lib/                    # Utilities and configurations
│   ├── api/                # API client functions
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Helper functions
│   └── context/            # React context providers
└── styles/                 # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm 8.0.0 or later
- Backend API running on port 8000

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd automation-ai-next
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Key Pages

### Dashboard
- **Overview**: System metrics and real-time monitoring
- **Analytics**: Advanced analytics and reporting
- **Settings**: Dashboard configuration

### Workflows
- **Designer**: Visual workflow builder with drag-and-drop
- **Management**: Create, edit, and manage workflows
- **Templates**: Pre-built workflow templates
- **Analytics**: Workflow performance metrics

### Robots
- **Fleet Management**: Monitor and control robot fleets
- **Individual Control**: Detailed robot control panels
- **Connection**: Connect new robots to the platform
- **Logs**: Real-time robot logs and diagnostics

### AI Management
- **Models**: AI model configuration and management
- **Task Delegation**: Intelligent task assignment
- **Training**: Model training and optimization
- **Inference**: Real-time AI inference monitoring

## 🛠️ Development

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Formatting
npm run format
npm run format:check
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 🎨 UI Components

### Basic Components
- **Button**: Various styles and states
- **Input**: Form inputs with validation
- **Card**: Content containers
- **Modal**: Dialog and overlay components
- **Table**: Data tables with sorting and pagination

### Advanced Components
- **WorkflowCanvas**: Visual workflow designer
- **RobotControls**: Robot control interfaces
- **MetricsChart**: Real-time data visualization
- **TaskQueue**: Task management interface

## 🔌 API Integration

The frontend integrates with the Python backend API:

```javascript
// Example API usage
import { workflowsApi } from '@/lib/api/workflows';

const workflows = await workflowsApi.getAll();
const newWorkflow = await workflowsApi.create(workflowData);
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Key environment variables for production:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
BACKEND_URL=https://api.your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
