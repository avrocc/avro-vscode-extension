# Release v0.0.2 - GitHub Authentication

**Released:** November 6, 2025  
**Package:** `avro-0.0.2.vsix` (58.98 KB)

## 🎉 Major Features

### Complete GitHub Authentication System
- ✅ Personal Access Token (PAT) validation via GitHub API
- ✅ Organization membership verification
- ✅ Role-based access control (Admin / Member)
- ✅ Secure credential storage using VSCode SecretStorage

### Sidebar Integration
- ✅ Authentication directly from Avro Items Explorer
- ✅ Single-step sign-in (PAT input only)
- ✅ Organization hardcoded to `avrocc`
- ✅ User status display with role indicator
- ✅ Logout functionality

### Role-Based Features
- ✅ Admin role: Full access to all items
- ✅ Member role: Standard item access
- ✅ Automatic item filtering based on role
- ✅ Role persistence across sessions

## 📋 What's New

### Authentication Flow
1. Click "Not authenticated" in sidebar
2. Enter GitHub Personal Access Token
3. Extension validates with GitHub API
4. Sidebar updates with username and role
5. Items automatically filtered by role

### Security
- PAT stored encrypted in VSCode SecretStorage
- User metadata stored securely
- Auto-validation of credentials on startup
- Auto-clear invalid credentials

### Technical Details
- **GitHub API Endpoints Used:**
  - `GET /user` - User validation and info
  - `GET /orgs/{org}/memberships/{username}` - Role verification
  
- **Default Configuration:**
  - Organization: `avrocc` (hardcoded)
  - Required scopes: `read:org`

## 🔧 Installation

### Option 1: From Package
```bash
code --install-extension avro-0.0.2.vsix
```

### Option 2: Manual Installation
1. Download `avro-0.0.2.vsix`
2. Open VSCode
3. Extensions → Install from VSIX...
4. Select the downloaded file

## 🚀 Usage

### First Time Setup
1. Open the Avro Items Explorer sidebar
2. Click "Not authenticated"
3. When prompted, enter your GitHub PAT
4. Extension validates and stores credentials
5. Sidebar updates to show authenticated status

### Getting a Personal Access Token
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select `read:org` scope (required)
4. Copy the token
5. Paste in VSCode prompt

### Logging Out
1. Right-click on your username in sidebar
2. Select "Avro: Logout"
3. Credentials are securely removed

## 📦 Package Contents

```
avro-0.0.2.vsix (58.98 KB)
├── Extension source code (dist/)
├── Documentation files
├── Media assets (icons)
└── Configuration files
```

## 🔗 Links

- **Repository:** https://github.com/avrocc/avro-vscode-extension
- **GitHub Token Settings:** https://github.com/settings/tokens
- **VSCode Extension Documentation:** https://code.visualstudio.com/api

## ✅ Testing Checklist

- [x] Compilation succeeds with no errors
- [x] Authentication flow works end-to-end
- [x] Role-based filtering functions correctly
- [x] Secure storage persists across sessions
- [x] Auto-validation works on startup
- [x] Logout clears credentials
- [x] Extension packages successfully

## 📝 Known Limitations

- Organization is hardcoded to `avrocc`
- Requires `read:org` scope on GitHub PAT
- Single organization support (extensible in future)

## 🔄 Future Enhancements

- [ ] Support for multiple organizations
- [ ] Custom organization selection
- [ ] Admin panel for role management
- [ ] Audit logging
- [ ] Token refresh functionality
- [ ] OAuth2 flow support

## 📞 Support

For issues or feature requests, please visit:
https://github.com/avrocc/avro-vscode-extension/issues
