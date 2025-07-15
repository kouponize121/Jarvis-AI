# Jarvis AI Assistant

A comprehensive AI-powered personal assistant that revolutionizes your productivity with intelligent task automation, smart meeting management, AI-powered email assistance, and comprehensive dashboard insights.

## 🚀 Features

### 🤖 AI Personal Assistant
- Natural language conversation with context awareness
- Intelligent command processing and task automation
- Proactive workflow management

### ✅ Smart Task Management
- Automated task follow-ups until completion
- Team task assignment with email notifications
- Smart deadline reminders and progress tracking
- Priority-based task organization

### 📝 Intelligent Todo Lists
- AI-powered todo creation and organization
- Automatic prioritization based on context
- Learning user preferences over time

### 📋 Meeting Intelligence
- Voice-activated meeting start/stop
- Real-time note-taking assistance
- Auto-generated comprehensive meeting minutes
- Meeting analytics and insights

### 📧 Email Automation
- AI-powered professional email drafting
- Automated sending and scheduling
- Smart follow-up reminders
- Professional email templates

### 📊 Comprehensive Dashboard
- Real-time productivity insights
- Performance analytics and trends
- Interactive charts and progress tracking
- System status monitoring

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React.js
- **Database**: SQLite (with MongoDB support)
- **AI**: OpenAI GPT Integration
- **Authentication**: JWT
- **Email**: SMTP Integration

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd jarvis-ai-assistant
```

### 2. Run Setup Script
```bash
./setup.sh
```

### 3. Configure Environment Variables

#### Backend Configuration (`backend/.env`)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="jarvis_database"
JWT_SECRET_KEY="your-secure-secret-key-here"
```

#### Frontend Configuration (`frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://your-backend-url.com
WDS_SOCKET_PORT=443
```

### 4. Install Dependencies

#### Backend
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
yarn install
```

### 5. Start the Application
```bash
sudo supervisorctl restart all
```

## 🔐 Security Configuration

### API Keys Setup (After Login)
1. **OpenAI API Key**: Configure in System Settings for AI features
2. **SMTP Settings**: Configure for email automation
   - SMTP Host
   - SMTP Port
   - SMTP Username
   - SMTP Password

### Important Security Notes
- Never commit `.env` files to Git
- Use strong JWT secret keys in production
- Keep API keys secure and rotate them regularly
- Use environment variables for all sensitive data

## 🎯 Usage

### Getting Started
1. Visit the application URL
2. Register a new account or login
3. Configure your API keys in System Settings
4. Start using natural language commands

### Example Commands
- "Create a task for John to review the project proposal by Friday"
- "Start meeting with sales team"
- "Draft a follow-up email for the client meeting"
- "Show me my productivity dashboard"

### Features Overview
- **Task Management**: Create, assign, and track tasks with automated follow-ups
- **Meeting Management**: Start meetings, take notes, generate minutes
- **Email Automation**: Draft and send professional emails
- **Dashboard**: Monitor productivity and system status

## 📱 Mobile Responsive

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices
- Various screen sizes and orientations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This is a web application designed for productivity enhancement. Ensure proper security measures are in place before deploying to production.
