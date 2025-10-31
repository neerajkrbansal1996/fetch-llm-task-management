# Fetch LLM - Task Management App

A Next.js-based task management application that processes meeting transcripts using Anthropic Claude LLM to extract structured tasks and displays them in a Kanban board for easy management.

## Features

- **AI-Powered Task Extraction**: Paste meeting transcripts and let Claude extract actionable tasks automatically
- **Structured Task Data**: Each task includes title, description, priority (high/medium/low), and optional assignee
- **Kanban Board**: Visual task management with drag-and-drop between To Do, In Progress, and Done columns
- **Task Management**: Edit, delete, and update task status, priority, and assignees
- **Database Persistence**: All tasks are stored in PostgreSQL using Prisma ORM

## Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- PostgreSQL database (local or hosted)
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fetch_llm?schema=public"
   ANTHROPIC_API_KEY="your-anthropic-api-key-here"
   # Optional: Specify Claude model (default: claude-3-5-sonnet-20241022)
   # ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Usage

1. **Process Transcripts**: Paste your meeting transcript into the textarea and click "Extract Tasks". The LLM will analyze the transcript and create structured tasks automatically.

2. **Manage Tasks**: 
   - Drag and drop tasks between columns to update their status
   - Click the edit icon to modify task details
   - Click the delete icon to remove tasks
   - Tasks are automatically saved to the database

3. **Task Details**: Each task shows:
   - Title and description
   - Priority level (High, Medium, Low) with color coding
   - Assignee (if specified)
   - Status (To Do, In Progress, Done)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── process-transcript/  # LLM transcript processing
│   │   └── tasks/               # Task CRUD operations
│   ├── components/
│   │   ├── TranscriptInput.tsx  # Transcript input form
│   │   ├── KanbanBoard.tsx      # Main Kanban board
│   │   ├── TaskCard.tsx         # Individual task card
│   │   └── TaskEditModal.tsx   # Task editing modal
│   ├── hooks/
│   │   └── useTasks.ts          # Task management hook
│   ├── lib/
│   │   └── prisma.ts            # Prisma client singleton
│   └── types/
│       └── task.ts              # TypeScript type definitions
prisma/
└── schema.prisma               # Database schema
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **LLM**: Anthropic Claude
- **Drag & Drop**: @dnd-kit
- **Date Utilities**: date-fns

## Development

- Run `pnpm dev` to start the development server
- Run `pnpm build` to create a production build
- Run `pnpm start` to start the production server

## Database Migrations

When making changes to the Prisma schema:
```bash
npx prisma migrate dev --name your-migration-name
```

View your database with Prisma Studio:
```bash
npx prisma studio
```
