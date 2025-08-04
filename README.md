# Restock App
<img src="restock-icon.png" alt="Restock App Icon" width="400">
<img src="IMG_1902.PNG" alt="Restock App Screenshot" width="400">

A mobile-first application designed to streamline the restocking process for small business and grocery store owners. This app transforms the traditional clipboard-based restocking workflow into an efficient, AI-powered system that reduces restock time from 3-4 hours to 15-25 minutes.

## The Problem

Small business and grocery store owners often manage 50-200 product restocks per location manually. The traditional process involves:
- Walking the store with a clipboard to jot down product names
- Manually looking up each supplier
- Formatting individual emails
- Double-checking quantities
- Repeating this process for every store they manage

This is a slow, error-prone, and mentally draining process done several times a week.

## Our Solution

Restock is a mobile-first app that replicates the clipboard experience but with AI-powered email generation and a smart product-supplier database. The app enables users to:

- Log products quickly while walking the store
- Auto-link products to suppliers
- Generate and send professional emails in minutes
- Track past orders and save time every week

## Progressive Learning & AI Enhancement

The app builds a database from the user's own data, learning and remembering product-to-supplier mappings over time:

- Initially, users input products manually as usual
- Over weeks, the system offers smarter autocomplete suggestions
- The AI uses this data to generate emails with minimal input from the user
- Eventually, the process shifts from manual entry toward smart, predictive restocking assistance

## Features

### Core Functionality
- Restock Sessions: Create and manage restocking sessions with real-time product tracking
- Smart Product Entry: Auto-complete suggestions based on previously used products
- Supplier Management: Automatic supplier linking and email generation
- Email Generation: AI-powered email creation grouped by supplier
- Session History: Track and review past restocking sessions

### User Experience
- Mobile-First Design: Optimized for on-the-go store walking
- Minimalistic UI: Clean, distraction-free interface
- One-Task-Per-Screen: Mental simplicity with focused workflows
- Smart Suggestions: Progressive learning system for faster data entry

## Technology Stack

- Framework: React Native with Expo
- Navigation: Expo Router with file-based routing
- State Management: Zustand
- Data Persistence: AsyncStorage for local data
- UI Components: Custom styled components with organized styling
- Development: TypeScript for type safety

## Development Progress

### Current Status: **Advanced Email System & User Identity Integration**
The application is in active development with significant progress across all core modules. Key accomplishments include:

**🏗️ Core Infrastructure (COMPLETE)**
- React Native + Expo Router with TypeScript implementation
- File-based routing with 4-tab navigation architecture
- Complete Supabase database schema (6 tables with full relationships)
- Comprehensive backend services layer (10+ services)
- Production-grade authentication system using Clerk

**🔐 Authentication & Security (COMPLETE)**
- Multi-provider authentication (email/password, Google SSO)
- Email verification flow with password strength validation
- Protected routes with session management
- OAuth flow optimization with race condition fixes
- User profile service with real-time data integration

**🤖 AI Integration (COMPLETE)**
- GROQ API integration for fast, cost-effective email generation
- Context-aware LLM prompts using authenticated user data
- Professional email templates with dynamic personalization
- Fallback email system for AI unavailability
- Email regeneration with proper context passing

**📊 Data Management (COMPLETE)**
- Complete CRUD operations for all entities
- Real-time dashboard with Supabase integration
- Session management with 20+ methods
- Product/supplier autocomplete and validation
- Email tracking and delivery status monitoring

**🎨 UI/UX Implementation (COMPLETE)**
- Mobile-first design with sage green theme
- Custom notification system with animations
- Form validation and error handling
- Email editing interface with visual feedback
- Empty state handling and pull-to-refresh functionality

**🧪 Quality Assurance (COMPLETE)**
- Comprehensive Jest test suite (authentication flows)
- React Native Testing Library for UI components
- OAuth completion and session refresh testing
- Integration testing for session management
- TypeScript strict mode with full type safety

### Next Phase Priorities
1. **Data Migration**: Transition from AsyncStorage to full Supabase integration
2. **Email Delivery**: Implement actual email sending via Resend integration
3. **Security**: Row Level Security (RLS) policies implementation
4. **Production**: Environment configuration and app store preparation

### Technical Architecture

**Frontend Stack**
- React Native with Expo SDK 53
- Expo Router (file-based routing)
- Zustand for state management
- NativeWind (Tailwind CSS) styling
- TypeScript with strict mode

**Backend Stack**
- Supabase (PostgreSQL database, authentication, edge functions)
- Clerk for authentication provider
- GROQ API for AI email generation
- Structured logging and error handling

**Development Tools**
- Jest + React Native Testing Library
- ESLint for code quality
- Custom component styling system
- Path aliases for clean imports

## Development

The main application code is located in the `restock/` directory. This is a mobile-first application designed for inventory management workflows.

A work in progress...
