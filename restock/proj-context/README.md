# 📚 Project Context Documentation

This directory contains all project context, development history, and implementation documentation for the Restock app.

## 📁 Documentation Files

### 🔐 Authentication Documentation
- **`AUTH_DEVELOPMENT_HISTORY.md`** - Complete history of auth development work
- **`AUTH_IMPLEMENTATION_SUMMARY.md`** - Comprehensive auth implementation overview
- **`SSO_FLOW_IMPLEMENTATION.md`** - SSO authentication flow documentation
- **`OAUTH_FLOW_FIXES.md`** - OAuth flow fixes and improvements
- **`GOOGLE_SSO_IMPLEMENTATION.md`** - Google SSO implementation guide

### 🛠️ Development Fixes & Improvements
- **`EMAIL_SIGNUP_NAME_FIXES.md`** - Email signup name capture fixes
- **`NAME_CAPTURE_FIXES.md`** - Name extraction and capture improvements
- **`KEYBOARD_HANDLING_IMPROVEMENTS.md`** - Keyboard handling enhancements
- **`EMAIL_SIGNUP_IMPROVEMENTS.md`** - Email signup flow improvements
- **`IMPROVED_FLOW_SUMMARY.md`** - Summary of flow improvements
- **`TROUBLESHOOTING_IMPORTS.md`** - Import troubleshooting guide

### 📋 Project Overview
- **`PROJECT_SUMMARY.md`** - Overall project summary and architecture

## 🎯 Quick Reference

### Authentication Architecture
- **Separate SSO Flow**: Google SSO users have dedicated authentication context
- **Email/Password Flow**: Traditional email/password authentication
- **Mixed Authentication**: Account linking between auth methods

### Key Technical Decisions
- **SSOAuthContext**: Handles Google SSO users with automatic detection
- **AuthContext**: Handles email/password authentication
- **Profile Management**: Supabase-based profile verification
- **Session Management**: AsyncStorage for local persistence

### Design Principles
- **Sage Green Theme**: (#6B7F6B, #A7B9A7) - avoid blue colors
- **Minimalistic UI**: Clean, flat hierarchy with single task focus
- **Organized Styling**: Separate style files per component
- **Clear Button Spacing**: Proper spacing without taking too much space

## 🔍 Finding Information

### Authentication Issues
- **PGRST116 Errors**: See `AUTH_DEVELOPMENT_HISTORY.md`
- **Name Extraction**: See `NAME_CAPTURE_FIXES.md`
- **OAuth Redirects**: See `OAUTH_FLOW_FIXES.md`
- **SSO Implementation**: See `SSO_FLOW_IMPLEMENTATION.md`

### Development History
- **Auth Development**: See `AUTH_DEVELOPMENT_HISTORY.md`
- **Email Signup**: See `EMAIL_SIGNUP_IMPROVEMENTS.md`
- **Keyboard Handling**: See `KEYBOARD_HANDLING_IMPROVEMENTS.md`
- **Import Issues**: See `TROUBLESHOOTING_IMPORTS.md`

### Project Overview
- **Architecture**: See `PROJECT_SUMMARY.md`
- **Auth Summary**: See `AUTH_IMPLEMENTATION_SUMMARY.md`
- **Google SSO**: See `GOOGLE_SSO_IMPLEMENTATION.md`

## 🚀 Development Workflow

### When Adding New Features
1. Check relevant documentation files for existing patterns
2. Follow established design principles
3. Update appropriate documentation files
4. Add tests to `tests/auth/` directory

### When Debugging Issues
1. Check `AUTH_DEVELOPMENT_HISTORY.md` for similar issues
2. Review `TROUBLESHOOTING_IMPORTS.md` for common problems
3. Consult specific fix documentation files
4. Update documentation with new solutions

### When Implementing Authentication
1. Follow SSO vs email/password separation
2. Use appropriate authentication contexts
3. Implement proper profile verification
4. Add comprehensive error handling

## 📊 Documentation Status

### ✅ Complete
- Authentication implementation
- SSO flow documentation
- Development history
- Technical fixes

### 🔄 In Progress
- Additional SSO providers
- Enhanced error handling
- Performance optimizations

### 📝 Planned
- Analytics implementation
- Deep linking improvements
- Additional OAuth providers

## 🔗 Related Directories

- **`tests/auth/`** - Authentication test files
- **`app/_contexts/`** - Authentication contexts
- **`backend/services/`** - Authentication services
- **`app/auth/`** - Authentication screens

---

*This directory serves as the central repository for all project context, development history, and implementation documentation for the Restock app.* 