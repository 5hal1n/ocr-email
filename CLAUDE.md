# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js application that receives receipts via email, extracts content using OCR, and saves them to Firebase. Uses Resend to receive emails, Upstage API for OCR and AI extraction, and React Table to display receipts in a list.

## Development Commands

### Next.js Application

```bash
# Start development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint with Biome
npm run lint

# Format code with Biome
npm run format
```

### Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start Firebase Emulator for local testing
npm run serve

# Deploy to Firebase
npm run deploy

# View function logs
npm run logs
```

## Environment Variables

### Next.js Application

Configure the following in `.env.local`:

- Firebase Admin SDK credentials - configured in `src/lib/firebase/admin.ts`
- `UPSTAGE_API_KEY` - Upstage API key (optional if hardcoded in the code)

### Cloud Functions

API keys are stored in Firebase Secret Manager:

```bash
# Set up secrets for Cloud Functions
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set UPSTAGE_API_KEY

# Access secrets (for verification)
firebase functions:secrets:access RESEND_API_KEY
firebase functions:secrets:access UPSTAGE_API_KEY
```

Before deploying, update `.firebaserc` with your Firebase project ID.

## Git Workflow

Follow this workflow for ALL code changes:

### 1. Create a Branch

- **ALWAYS create a new branch** before starting any work
- Use descriptive branch names (e.g., `feat/add-receipt-filter`, `fix/ocr-parsing`)
- Never commit directly to `master`

### 2. Work on the Task

- Make your changes
- Test thoroughly

### 3. Commit Changes

- **ALWAYS commit your changes** when work is complete
- Follow **Conventional Commits** specification: https://www.conventionalcommits.org/
- Commit message format: `<type>(<scope>): <description>`

**Common types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)

**Examples:**
```bash
feat(receipt): add filtering by date range
fix(ocr): handle empty merchant name
docs(readme): update installation instructions
refactor(firebase): extract storage logic to separate file
chore(deps): update next to v16.0.8
```

### 4. Merge Branch

- **ALWAYS merge your branch back to master** after committing
- Use `git checkout master && git merge <branch-name>`
- Delete the feature branch after merging: `git branch -d <branch-name>`

## Architecture

### Data Flow

1. **Email Reception** (Cloud Function: `receiveEmail`)
   - Firebase Cloud Function with HTTPS trigger
   - Location: `functions/src/handlers/receiveEmail.ts`
   - Receives Resend webhook events (`email.received`)
   - Downloads attachments using Resend SDK
   - Note: The Next.js API route (`src/app/api/received/route.ts`) is deprecated

2. **OCR Processing** (`src/lib/upstage/documentParse.ts`)
   - Uses Upstage Document Parse API
   - Extracts text, HTML, and Markdown from images
   - Model: `document-parse-250618`

3. **AI Extraction** (`src/lib/upstage/chat.ts`)
   - Uses OpenAI-compatible Upstage Solar Pro 2 model
   - Extracts `merchant_name` (store name) and `total_amount` (total price) from OCR results
   - Structured output with Zod schema

4. **Data Storage** (Cloud Function: `receiveEmail`)
   - Saves to Firebase Firestore `receipts` collection
   - Uploads images to Firebase Storage with public URLs
   - Fields: `id`, `merchant_name`, `total_amount`, `image_url`, `created_at`

5. **Display** (`src/components/usecase/receiptDataTable.tsx`)
   - Client-side data table using TanStack React Table
   - Fetches and displays data from Firebase Firestore

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
  - `api/received/` - (Deprecated) Webhook endpoint - migrated to Cloud Functions
- `src/components/` - React components
  - `ui/` - Basic UI components from shadcn/ui
  - `usecase/` - Components containing business logic
- `src/lib/` - Utilities and API clients
  - `firebase/` - Firebase clients (admin, client)
  - `upstage/` - Upstage API integration (OCR, chat)
- `functions/` - Firebase Cloud Functions
  - `src/index.ts` - Main entry point, exports `receiveEmail` function
  - `src/handlers/` - Function handlers
    - `receiveEmail.ts` - Email webhook processing logic
  - `src/lib/upstage/` - Upstage utilities (copied from src/lib/)
  - `src/types/` - Type definitions for Cloud Functions

### Tech Stack

- **Framework**: Next.js 16 (App Router, React Compiler enabled)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: Firebase (Firestore)
- **Storage**: Firebase Storage
- **External APIs**:
  - Resend: Email reception and webhooks
  - Upstage: Document Parse API (OCR)
  - Upstage: Solar Pro 2 (AI chat, OpenAI-compatible)
- **State Management**: React hooks
- **Table**: TanStack React Table v8
- **Validation**: Zod v4
- **Lint/Format**: Biome

## Important Implementation Details

### Cloud Functions Deployment

**Function Specifications:**
- Name: `receiveEmail`
- Trigger: HTTPS (POST)
- Region: `asia-northeast1` (Tokyo)
- Memory: 512MB
- Timeout: 540 seconds (9 minutes)
- Secrets: `RESEND_API_KEY`, `UPSTAGE_API_KEY`

**Deployment Steps:**
1. Update `.firebaserc` with your Firebase project ID
2. Set up secrets: `firebase functions:secrets:set RESEND_API_KEY` and `UPSTAGE_API_KEY`
3. Build and deploy: `cd functions && npm run deploy`
4. Update Resend webhook URL to: `https://asia-northeast1-PROJECT_ID.cloudfunctions.net/receiveEmail`

**Local Testing:**
```bash
cd functions
npm run serve  # Start Firebase Emulator
# Test with curl or Postman to http://localhost:5001/PROJECT_ID/asia-northeast1/receiveEmail
```

### API Authentication

- API keys are stored in Firebase Secret Manager (recommended for production)
- Cloud Functions automatically access secrets via environment variables
- Next.js application still uses environment variables for Firebase client SDK

### TypeScript Path Aliases

- `@/*` maps to `./src/*` (tsconfig.json)

### Firebase Clients

- **Admin SDK**: `@/lib/firebase/admin` - Server-side access to Firestore and Storage
- **Client SDK**: `@/lib/firebase/client` - Browser access to Firestore

### Biome Configuration

- Indentation: 2 spaces
- Recommended rules for Next.js and React enabled
- Automatic import organization
