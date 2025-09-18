# UIW - Ultimate Intimate Workspace

A private, self-hosted, mobile-first intimacy app designed exclusively for two users. Built with Next.js, Express, PostgreSQL, and integrated with MinIO, VoceChat, OpenWebUI, Ollama, and Piper TTS.

## 🌟 Features

### Core Features
- **🔐 Secure JWT Authentication** - Advanced security with session management
- **💬 Private Chat** - Real-time messaging with media sharing
- **📅 Intimate Bookings** - Plan special moments and dates together
- **📖 Fantasy Journal** - Share deepest thoughts and desires safely
- **🎵 TTS Erotica** - AI-generated intimate audio content with Piper TTS
- **🎨 Mood Themes** - Customizable atmosphere and visual themes
- **🔒 Consent Features** - Built-in consent management and content blurring
- **💾 Backup & Restore** - Complete data backup and restoration tools

### Integrations
- **🎬 RedGifs Integration** - Seamless media content integration (stub)
- **🔗 Lovense Integration** - Smart device connectivity (stub)
- **💬 VoceChat** - Enhanced messaging capabilities
- **🤖 OpenWebUI** - AI-powered interactions
- **🧠 Ollama** - Local AI model integration
- **📁 MinIO** - Secure file storage and management

### Technical Features
- **📱 Mobile-First Design** - Optimized for mobile devices
- **🐳 One-Command Deploy** - Complete Docker setup
- **🎯 Onboarding Wizard** - Smooth user setup experience
- **⚡ Real-time Updates** - Socket.IO powered real-time features
- **🛡️ Privacy Focused** - End-to-end security measures

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- At least 4GB RAM
- 10GB free disk space

### One-Command Deployment

```bash
git clone <repository-url>
cd UIW
chmod +x deploy.sh
./deploy.sh
```

The deployment script will:
1. Set up all required services
2. Initialize the database
3. Configure MinIO storage
4. Download necessary AI models
5. Start all containers

### Access Your App

After deployment, access these services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **VoceChat**: http://localhost:3009
- **OpenWebUI**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

### Default Credentials

- **MinIO**: `minioadmin` / `minioadmin123`

## 🏗️ Architecture

### Services Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (Next.js)     │────│   (Express)     │────│   Database      │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │     MinIO       │             │
         └──────────────│  File Storage   │─────────────┘
                        │   Port: 9000    │
                        └─────────────────┘
                                 │
         ┌─────────────────┐     │     ┌─────────────────┐
         │   VoceChat      │─────┼─────│   OpenWebUI     │
         │   Port: 3009    │     │     │   Port: 8080    │
         └─────────────────┘     │     └─────────────────┘
                                 │
         ┌─────────────────┐     │     ┌─────────────────┐
         │   Ollama        │─────┼─────│   Piper TTS     │
         │   Port: 11434   │     │     │   Port: 10200   │
         └─────────────────┘     │     └─────────────────┘
```

### Database Schema

The app uses PostgreSQL with the following key tables:
- `users` - User accounts (limited to 2)
- `chat_messages` - Private messaging
- `bookings` - Intimate appointments
- `fantasy_entries` - Journal entries
- `tts_content` - Generated audio content
- `mood_themes` - Visual themes
- `media_files` - File uploads
- `consent_logs` - Consent tracking

## 🛠️ Development

### Local Development Setup

1. **Clone and setup**:
```bash
git clone <repository-url>
cd UIW
```

2. **Backend development**:
```bash
cd backend
npm install
npm run dev
```

3. **Frontend development**:
```bash
cd frontend
npm install
npm run dev
```

4. **Database setup**:
```bash
docker-compose up postgres -d
```

### Environment Variables

Create `.env` files in backend and frontend directories:

**Backend `.env`**:
```env
NODE_ENV=development
DATABASE_URL=postgresql://uiw_user:uiw_password@localhost:5432/uiw_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

**Frontend `.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_VOCECHAT_URL=http://localhost:3009
NEXT_PUBLIC_OPENWEBUI_URL=http://localhost:8080
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure sessions
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Two-user limit enforcement

### Privacy & Consent
- Content blur features for sensitive material
- Explicit consent tracking and management
- Secure file storage with encryption options
- Private messaging with read receipts

### Data Protection
- Database encryption at rest
- Secure file upload validation
- HTTPS enforcement in production
- Regular security updates

## 📱 Mobile Features

### PWA Support
- Installable web app
- Offline capabilities
- Push notifications (planned)
- Touch-optimized interface

### Responsive Design
- Mobile-first approach
- Touch gestures support
- Adaptive layouts
- Performance optimized

## 🔧 Configuration

### Customization Options

1. **Themes**: Customize colors, backgrounds, and mood settings
2. **Privacy**: Adjust consent requirements and blur settings
3. **Integrations**: Enable/disable external services
4. **Backup**: Configure automatic backup schedules

### Performance Tuning

- Adjust database connection pools
- Configure MinIO bucket policies
- Optimize image/video processing
- Set up CDN if needed

## 📊 Monitoring & Maintenance

### Health Checks
- Built-in health endpoints
- Service status monitoring
- Database connection testing
- File storage verification

### Backup & Recovery
- Automated database backups
- File storage synchronization
- Configuration export/import
- Disaster recovery procedures

### Updates
- Rolling updates support
- Database migration tools
- Service version management
- Configuration updates

## 🤝 Support

### Troubleshooting

Common issues and solutions:

1. **Service won't start**: Check Docker daemon and port availability
2. **Database connection**: Verify PostgreSQL is running and credentials
3. **File upload issues**: Check MinIO service and bucket permissions
4. **Authentication problems**: Verify JWT secret and session storage

### Logs

Access service logs:
```bash
docker-compose logs [service-name]
```

### Reset & Cleanup

Complete reset:
```bash
docker-compose down -v
docker system prune -a
./deploy.sh
```

## 📄 License

Private - This is a personal intimate application not intended for public distribution.

## ⚠️ Important Notes

- This app is designed for exactly **2 users only**
- All data is stored locally on your infrastructure
- Regular backups are recommended
- Keep your deployment secure and private
- Update passwords and secrets before production use

---

**Built with ❤️ for intimate connections**