# GitHub-Style Sign-In WebView Implementation

## Overview

The authentication flow now uses a beautiful, GitHub-style WebView instead of a tree view button. This provides a professional, polished sign-in experience that matches GitHub's UI design.

## Features

### 1. Professional Sign-In WebView 🎨
- GitHub-style design with green button (`#238636`)
- Centered, clean layout
- Feature list showing benefits
- Large, prominent "Sign in to GitHub" button
- Matches VSCode dark theme automatically

### 2. Full Authentication Flow
```
User clicks "Avro: Authenticate with GitHub" command
                    ↓
      Beautiful GitHub-style WebView appears
      with "Sign in to GitHub" button
                    ↓
         User clicks the green button
                    ↓
      WebView closes, input dialogs appear
      (Organization + PAT)
                    ↓
      GitHub API validation and role detection
                    ↓
      User authenticated and items displayed
```

## UI Design

### Sign-In WebView
```
╔════════════════════════════════════════╗
║                                        ║
║            🔐                          ║
║                                        ║
║        Avro Extension                  ║
║                                        ║
║   Sign in with your GitHub account     ║
║   to access Avro's features based on   ║
║   your organization role.              ║
║                                        ║
║  ┌────────────────────────────────┐   ║
║  │  Sign in to GitHub             │   ║ ← Green GitHub-style button
║  └────────────────────────────────┘   ║
║  ┌────────────────────────────────┐   ║
║  │  Cancel                        │   ║
║  └────────────────────────────────┘   ║
║                                        ║
║   Features                             ║
║   ✓ Secure authentication with PAT     ║
║   ✓ Role-based access control          ║
║   ✓ Organization membership check      ║
║   ✓ Automatic credential storage       ║
║                                        ║
╚════════════════════════════════════════╝
```

### Tree View (Not Authenticated)
```
AVRO ITEMS EXPLORER
├── ⓘ Not authenticated
│   Run "Avro: Authenticate with GitHub"
│   command to sign in
```

### Tree View (Authenticated)
```
AVRO ITEMS EXPLORER
├── 👤 username
│   Role: admin | Click to logout
├── 📁 Documents
│   ├── 📄 Report.pdf
│   └── 📄 Notes.txt
└── 📁 Actions
    ├── ⚡ Deploy
    └── 🧪 Test
```

## File Structure

### New File: `src/ui/signInWebView.ts`
```typescript
showSignInWebView(context)              // Creates and shows WebView
getWebViewContent(): string             // Generates HTML/CSS/JS
```

Features:
- HTML content with GitHub-style design
- CSS that respects VSCode theme
- JS message handling for button clicks
- Responsive and accessible

### Updated Files

#### `src/extension.ts`
- Import `showSignInWebView` instead of `showGitHubSignInButton`
- Call WebView before showing dialogs
- Cleaner authentication flow

#### `src/itemsProvider.ts`
- Show "Not authenticated" message in tree instead of button
- Only button (logout) appears in authenticated state

## How It Works

### Step 1: User Runs Command
```typescript
// User presses Ctrl+Shift+G or runs "Avro: Authenticate with GitHub"
vscode.commands.registerCommand('avro.authenticate', async () => {
  // Show the beautiful WebView
  const signInConfirmed = await showSignInWebView(context);
```

### Step 2: WebView Appears
- Professional GitHub-style sign-in interface
- User clicks green "Sign in to GitHub" button
- WebView sends message to extension

### Step 3: Dialog Flow
- Organization input dialog (default: avrocc)
- PAT input dialog (masked)
- GitHub API calls for validation and role

### Step 4: Success
- Role stored securely
- Tree view updated with items
- User status shown with role

## WebView HTML/CSS

The WebView uses:
- **HTML5** for semantic structure
- **CSS3** with VSCode theme colors
- **JavaScript** for message handling
- **GitHub Design System** for visual consistency

### Color Scheme
```css
Background: var(--vscode-editor-background, #1e1e1e)
Foreground: var(--vscode-foreground, #e0e0e0)
Button: #238636 (GitHub green)
Button Hover: #2ea043
Button Active: #1a7a2f
```

### Responsive Design
- Works on all screen sizes
- Centered layout with max-width
- Proper padding and spacing
- Mobile-friendly

## Security

✓ WebView is disposable (closed after use)
✓ No sensitive data in WebView
✓ Scripts only handle button clicks
✓ Message passing for state updates
✓ Context retained for session management

## User Experience Flow

### First Time User
1. Opens Avro sidebar
2. Sees: "Not authenticated - Run command to sign in"
3. Opens command palette (`Cmd+Shift+P`)
4. Types: "Avro: Authenticate with GitHub"
5. Beautiful WebView appears with sign-in button
6. Clicks green button
7. Organization and PAT dialogs appear
8. After success, items appear with role info

### Returning User
1. Opens Avro sidebar
2. Extension auto-authenticates
3. Sees: "👤 username" with role
4. All items visible based on role

### Logout
1. Click username in tree view
2. Confirm logout
3. Back to "Not authenticated" message
4. Can re-authenticate anytime

## Comparison: Before vs After

### Before (Tree View Button)
```
├── Authenticate with GitHub  ← Tree item, not visually distinct
│   Click to login...
```

### After (WebView)
```
AVRO ITEMS EXPLORER
├── ⓘ Not authenticated
│   Run command to sign in

         ⇓ Click command ⇓

╔════════════════════════════════════════╗
║  🔐 Avro Extension                     ║
║                                        ║
║  Sign in with your GitHub account      ║
║                                        ║
║  ┌────────────────────────────────┐   ║
║  │  Sign in to GitHub             │   ║ ← Beautiful button!
║  └────────────────────────────────┘   ║
│                                        ║
│  Features                              ║
│  ✓ Secure authentication with PAT      ║
│  ✓ Role-based access control           ║
│  ✓ Organization membership check       ║
│  ✓ Automatic credential storage        ║
│                                        ║
╚════════════════════════════════════════╝
```

## Keyboard Shortcuts

| Shortcut | Command |
|----------|---------|
| `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`) | Authenticate with GitHub |
| `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`) | Show Avro Items Panel |

## Error Handling

If authentication fails:
1. WebView closes
2. User sees error message
3. Can retry by running command again
4. No data corruption or inconsistent state

## Testing

### Test Case 1: Sign-In Flow
1. Run "Avro: Authenticate with GitHub"
2. ✓ WebView appears with GitHub-style button
3. ✓ Button is green and clickable
4. ✓ Layout is centered and professional
5. ✓ Features list is visible

### Test Case 2: Cancel
1. Run command to open WebView
2. Click "Cancel" button
3. ✓ WebView closes
4. ✓ No dialogs appear
5. ✓ No side effects

### Test Case 3: Sign-In Success
1. Run command
2. Click button
3. Enter organization
4. Enter valid PAT
5. ✓ WebView closes automatically
6. ✓ Items appear in tree
7. ✓ User status shows role

### Test Case 4: Invalid Token
1. Enter invalid PAT
2. ✓ Error message shown
3. ✓ Can retry
4. ✓ No data stored

## Customization

The WebView can be customized by editing `getWebViewContent()`:

```typescript
// Change button color
background: #238636;  // GitHub green

// Change logo
<div class="logo">🔐</div>  // Emoji or image

// Add more features to list
<li>Your feature here</li>

// Change text
<h1>Your Title</h1>
<p class="subtitle">Your description</p>
```

## Files Changed

| File | Change | Lines Added |
|------|--------|-------------|
| `src/ui/signInWebView.ts` | NEW | ~180 |
| `src/extension.ts` | Updated import & flow | ~5 |
| `src/itemsProvider.ts` | Simplified tree items | ~10 |

## Benefits

✨ **Professional Design** - Matches GitHub's look and feel
✨ **Better UX** - Clear call-to-action with big button
✨ **Theme Compatible** - Uses VSCode's theme colors
✨ **Responsive** - Works on all window sizes
✨ **Accessible** - Proper semantic HTML
✨ **Simple Flow** - Clear steps to authentication
✨ **Error Friendly** - Good error handling
✨ **No Dependencies** - Pure HTML/CSS/JS

## Summary

The new WebView-based sign-in provides:
- ✅ Beautiful GitHub-style interface
- ✅ Professional user experience
- ✅ Clear authentication flow
- ✅ Prominent call-to-action
- ✅ Theme integration
- ✅ Full role-based access control
- ✅ Secure credential handling

---

**Ready to Test!** 🚀
