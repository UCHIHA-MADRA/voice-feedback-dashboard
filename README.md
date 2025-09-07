# AI Voice & File Feedback Dashboard

A modern Vue 3 application that provides AI-powered voice and file analysis with real-time feedback, scoring, and visualization.

## 🚀 Features

- **File Upload & Analysis**: Support for audio (MP3, WAV, M4A) and text files (TXT, DOC, PDF)
- **Voice Recording**: Browser-based audio recording with real-time controls
- **AI Analysis**: Comprehensive scoring for clarity, engagement, and sentiment
- **Interactive Charts**: Visual representation of analysis results using Chart.js
- **Analysis History**: Track and compare multiple analysis sessions
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern Architecture**: Vue 3 Composition API, Pinia state management, TypeScript support

## 🛠️ Tech Stack

- **Frontend**: Vue 3.4+, Composition API
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Pinia 2.1+
- **HTTP Client**: Axios 1.6+
- **Charts**: Chart.js 4.4+ with Vue-ChartJS
- **Build Tool**: Vite 5.0+
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint + Prettier

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ai-voice-feedback-dashboard.git
cd ai-voice-feedback-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your API configuration

5. Start the development server:
```bash
npm run dev
```

## 🚢 Deployment

This project can be deployed to Vercel or Render. For detailed deployment instructions, see the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

### Quick Deployment

#### Vercel

```bash
npm install -g vercel
vercel login
vercel
```

#### Render

Push your code to a Git repository and connect it to Render using the included `render.yaml` configuration file.

## 📊 Project Structure

```
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable Vue components
│   │   ├── features/    # Feature-specific components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   ├── composables/     # Reusable composition functions
│   ├── router/          # Vue Router configuration
│   ├── services/        # API and service layer
│   ├── stores/          # Pinia state stores
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── .env.example         # Example environment variables
├── index.html           # HTML entry point
├── package.json         # Project dependencies
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run tests with UI:

```bash
npm run test:ui
```

Generate test coverage report:

```bash
npm run test:coverage
```

## 📝 License

MIT