# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

This is a **Prompt Template Management System** (提示词管理系统) for managing AI prompt templates with features like:
- Multi-keyword search and filtering
- Template versioning with rollback support
- Tag-based categorization
- Memos API integration (optional)
- One-click copy to clipboard

## Architecture

### Backend (Node.js + Express + Prisma)
- **Location**: `backend/`
- **Entry point**: `backend/src/server.js`
- **Database**: SQLite via Prisma ORM (`prisma/schema.prisma`)
- **API Documentation**: Swagger UI at `/api-docs`

### Frontend (Next.js 14 + React + TypeScript)
- **Location**: `frontend/`
- **Framework**: Next.js 14 with App Router (`app/` directory)
- **Styling**: Tailwind CSS

## Development Commands

### Quick Start
```bash
# Start both backend and frontend (Linux/Mac)
./start.sh

# Start both (Windows)
start.bat
```

### Backend Only
```bash
cd backend
npm install
npm run dev          # Start with --watch for auto-reload
npm run start        # Production start

# Prisma database commands
npm run prisma:generate    # Generate Prisma client
npm run prisma:push        # Push schema to database
npm run prisma:studio      # Open Prisma Studio
npm run seed              # Seed database with initial data
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
./test.sh            # Run API integration tests
```

### Docker
```bash
docker-compose up    # Start all services
docker-compose build # Rebuild images
docker-compose down  # Stop services
```

## Database Schema

Key tables (defined in `backend/prisma/schema.prisma`):
- **User** - User accounts with JWT authentication
- **Template** - Prompt templates with title, content, category
- **TemplateKeyword** - Multiple keywords per template
- **Tag** - Custom tags with colors
- **TemplateTag** - Many-to-many relationship between templates and tags
- **TemplateVersion** - Version history for rollback support
- **Memo** - Memos integration records

### Version Control Pattern
When a template is updated, the system:
1. Counts existing versions: `prisma.templateVersion.count({ where: { templateId } })`
2. Creates new version record with incremented version number
3. Stores content snapshot for potential rollback

### Cascade Deletes
All related data (keywords, tags, versions) is automatically deleted when a template is deleted due to `onDelete: Cascade` in Prisma schema.

## API Patterns

### Authentication
- JWT-based authentication via `src/middleware/auth.js`
- Protected routes require `Authorization: Bearer <token>` header
- Token extracted from `req.user` in controllers

### Controller Pattern
Controllers follow this structure:
```javascript
export const actionName = async (req, res, next) => {
  try {
    // ... logic
    res.json({ success: true, data: ... })
  } catch (error) {
    next(error)  // Pass to error middleware
  }
}
```

### Route Pattern
Routes are defined in `src/routes/` and follow RESTful conventions:
- `GET /api/templates` - List with pagination (`?page=1&pageSize=10`)
- `GET /api/templates/:id` - Get single
- `POST /api/templates` - Create
- `PUT /api/templates/:id` - Update
- `DELETE /api/templates/:id` - Delete
- `POST /api/templates/:id/rollback/:version` - Rollback

Query parameters for filtering:
- `keyword` - Search in title, description, content, keywords
- `category` - Filter by category
- `tag` - Filter by tag name

### Prisma Query Patterns
```javascript
// With relations and pagination
prisma.template.findMany({
  where: { userId },
  skip,
  take,
  include: { keywords: true, tags: { include: { tag: true } } },
  orderBy: { updatedAt: 'desc' }
})

// Connect or create pattern (used for tags)
tag: {
  connectOrCreate: {
    where: { name: tag },
    create: { name: tag, userId }
  }
}
```

## Environment Variables

Backend (`backend/.env`):
```
DATABASE_URL="file:../data/prompts.db"
JWT_SECRET="weixintishici-secret-key-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
MEMOS_API_URL=""   # Optional
MEMOS_API_KEY=""   # Optional
CORS_ORIGIN="*"
```

Frontend (`frontend/.env.local`):
```
# Create if needed for API configuration
```

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Access URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs
- Health Check: http://localhost:3001/health

## File Structure Notes

- Backend uses ES modules (`"type": "module"` in package.json)
- Frontend uses TypeScript with Next.js 14 App Router
- Database files stored in `data/` directory (SQLite)
- Documentation in `docs/` folder (plan.md, database.md, api.md, frontend.md)
