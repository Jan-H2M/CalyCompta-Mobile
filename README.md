# CalyCompta

Web application for Calypso Diving Club financial management and member administration.

## Tech Stack

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS

## Quick Start

```bash
# Navigate to the web app directory
cd calycompta-app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

The application is automatically deployed to Vercel on push to the main branch.

- **Production URL**: https://calycompta.vercel.app
- **Deployment Platform**: Vercel
- **API Functions**: Located in `calycompta-app/api/`

## Project Structure

```
calycompta-app/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts
│   ├── services/        # Firebase and business logic services
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── api/                # Vercel serverless functions
├── public/             # Static assets
└── dist/              # Build output
```

## Firebase Configuration

- **Project ID**: calycompta
- **Auth Providers**: Email/Password
- **Database**: Firestore
- **Storage**: For expense receipts and documents
- **Functions**: User activation and automated tasks

## Features

### Core Modules
- 💰 **Banking Transactions** - Import, categorize, and reconcile bank transactions
- 📝 **Expense Management** - Reimbursement requests with approval workflow
- 📅 **Events & Activities** - Dive trips, training, and club events
- 👥 **Member Management** - User administration and role-based permissions

### Optional Modules (Coming Soon)
- 📦 **Inventory Management** - Equipment tracking, loans, and maintenance
- ✈️ **Excursions & Travel** - Trip planning, bookings, and payments

### System Features
- 🔐 Dynamic role-based permissions per module
- ⚙️ Modular architecture for easy extensibility
- 📊 Financial reporting and analytics
- 📄 Document storage and management
- ✉️ Email communication system
- 🤖 AI-powered expense categorization
- 📆 Fiscal year management

## Development

### Getting Started

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Migration to Modular Architecture

CalyCompta is currently undergoing a major architectural upgrade to a fully modular system. See the [migration documentation](docs/migration/) for details.

**Quick Links:**
- 📖 [Start Here - Migration Guide](docs/migration/START_HERE.md)
- 🏗️ [Architecture Summary](docs/migration/MODULAR_ARCHITECTURE_SUMMARY.md)
- 📋 [Full TODO List](TODO.md)

**Status:** Planning Complete ✅ | Implementation: Planned for 15-20 days

## Environment Variables

Required environment variables for deployment:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY` (for API functions)

## Contact

For questions about the application, please contact the Calypso Diving Club administration.