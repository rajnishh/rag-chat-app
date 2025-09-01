# RAG Chat App

A React-based frontend application for the RAG (Retrieval-Augmented Generation) Chat system.

## 🚀 Features

- Real-time chat interface
- Session management with history
- Collapsible sidebar for better space utilization
- Search functionality for past conversations
- Mobile-responsive design
- Dark/Light mode support
- Message editing and deletion
- Conversation favorites and renaming

## 🛠 Tech Stack

- React 18+
- Axios for API calls
- Lucide React for icons
- date-fns for date formatting
- WebSocket for real-time communication

## 📁 Project Structure

```
src/
├── components/              # React components
│   ├── ChatInterface/      # Main chat interface
│   ├── InputArea/          # Message input component
│   ├── MessageList/        # Chat messages display
│   └── SessionSidebar/     # Chat sessions sidebar
├── contexts/               # React contexts
├── hooks/                  # Custom React hooks
├── services/              # API and WebSocket services
├── styles/                # Global and component styles
└── utils/                 # Helper functions and constants
```

## 🚦 Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd rag-chat-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.txt .env.local
```

4. Start the development server
```bash
npm start
```

## 🔧 Configuration

Create a `.env.local` file with the following variables:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/ragchat
REACT_APP_WS_URL=ws://localhost:8080/ragchat/ws 
REACT_APP_API_KEY=your-api-key
```

## 📱 Mobile Support

The application is responsive and supports mobile devices with:
- Collapsible sidebar
- Touch-friendly interface
- Adaptive layout for different screen sizes

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details

## 👥 Authors

- Rajnish Kumar - *Initial work* - [YourGithub](https://github.com/rajnishh)

## 🙏 Acknowledgments

- React Team for the amazing framework
- All contributors who have helped this project
