# Role-Based Access Control (RBAC) - UI Implementation

## Overview

The Avro extension now implements role-based access control (RBAC) with GitHub organization roles, displaying different content based on the authenticated user's role.

## Features

### 1. GitHub-Style Sign-In Button
When not authenticated:
- Shows prominent "Sign in to GitHub" button using Quick Pick UI
- Matches GitHub's visual style for consistency
- One-click access to authentication

### 2. User Role Display
When authenticated:
- Shows user profile with role information
- Format: `👤 username` with description showing `Role: admin | member`
- Clear indication of current permission level

### 3. Role-Based Content Filtering
Items displayed based on user role:
- **Admin Role**: Access to all items and features
- **Member Role**: Access to standard items

### 4. Automatic Re-authentication
- On extension startup, validates stored credentials
- Automatically restores user session with role
- Shows user with role if already authenticated

## Architecture

### Components

#### 1. **SignInButton UI** (`src/ui/signInButton.ts`)
```typescript
showGitHubSignInButton()     // Shows GitHub sign-in button
showUserMenu()               // Shows user profile with logout option
```

#### 2. **Secure Storage with Role** (`src/utils/secureStorage.ts`)
```typescript
storeRole(role)              // Store user role
getRole()                    // Retrieve user role
```

#### 3. **Authentication with Role** (`src/github/auth.ts`)
```typescript
authenticateUser()           // Returns user + role
```

#### 4. **ItemsProvider Filtering** (`src/itemsProvider.ts`)
```typescript
setAuthenticationState()     // Set auth state with role
filterItemsByRole()          // Filter items based on role
```

## User Experience Flow

### First Time User (Not Authenticated)

```
Extension Opens
    ↓
Shows: "Sign in to GitHub" button
    ↓
User clicks button
    ↓
Shows: Organization name dialog (default: avrocc)
    ↓
Shows: GitHub PAT dialog
    ↓
Validates PAT and gets user role
    ↓
On Success:
  ├─ Stores: PAT, username, org, role
  ├─ Shows: "👤 username" with "Role: admin" or "Role: member"
  └─ Displays: All accessible items based on role
    ↓
On Error: Shows error message, offers retry
```

### Returning User (Already Authenticated)

```
Extension Opens
    ↓
Finds stored credentials
    ↓
Validates PAT against GitHub API
    ↓
On Valid:
  ├─ Restores: username and role
  ├─ Shows: "👤 username" with role
  └─ Displays: All accessible items based on role
    ↓
On Invalid:
  ├─ Clears: All stored credentials
  └─ Shows: "Sign in to GitHub" button
```

### Logout

```
User clicks on user status or logout command
    ↓
Shows: Confirmation dialog
    ↓
On Confirm:
  ├─ Clears: All credentials and role
  ├─ Shows: "Sign in to GitHub" button
  └─ Resets: Extension to initial state
    ↓
On Cancel: User remains authenticated
```

## Role-Based Item Display

### Admin Role (Role: admin)
Can see and access:
- ✓ All Documents
- ✓ All Actions (Deploy, Test)
- ✓ All standard items
- ✓ Admin-only features (if added)

### Member Role (Role: member)
Can see and access:
- ✓ Documents
- ✓ Basic Actions (Deploy, Test)
- ✓ Standard items
- ✗ Admin-only features

## UI State Diagram

```
┌─────────────────────────────────┐
│     Extension Activation        │
├─────────────────────────────────┤
│                                 │
│  Check: Stored credentials?     │
│                                 │
└──────────────────┬──────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   ┌─────────┐          ┌──────────┐
   │ Found   │          │ Not Found │
   └────┬────┘          └─────┬────┘
        │                    │
        ▼                    ▼
   ┌─────────────────┐  ┌─────────────────────┐
   │ Validate PAT    │  │ Show Sign-in Button │
   │ with GitHub API │  │                     │
   └────┬────────────┘  │ "Sign in to GitHub" │
        │               └─────────────────────┘
   ┌────┴────────┐            │
   │             │            │
   ▼ Valid       ▼ Invalid    ▼ Clicked
 ┌─────┐     ┌─────────┐  ┌──────────────────┐
 │Show │     │ Clear   │  │ Show Auth Dialog │
 │User │     │ Storage │  │ - Org name       │
 │Role │     │ Show    │  │ - PAT            │
 │     │     │ Sign-in │  └─────┬────────────┘
 └─────┘     │ Button  │        │
             └─────────┘        ▼
                          ┌────────────────┐
                          │ Authenticate   │
                          │ Get User + Role│
                          └────┬───────────┘
                               │
                          ┌────┴─────┐
                          │           │
                    ▼ Success   ▼ Error
                  ┌─────┐   ┌────────┐
                  │Show │   │ Show   │
                  │User │   │ Error  │
                  │Role │   │ Retry? │
                  └─────┘   └────────┘
                               │
                          ┌────┴─────────┐
                          │              │
                         ▼ Yes         ▼ No
                    ┌─────────────┐   ┌─────────┐
                    │ Re-show     │   │ Show    │
                    │ Auth Dialog │   │ Sign-in │
                    └─────────────┘   │ Button  │
                                      └─────────┘
```

## Data Storage

### Secure Storage (Encrypted)
- **PAT** - GitHub Personal Access Token (via SecretStorage)

### Workspace State (Plain)
- **Organization** - GitHub org name
- **Username** - Authenticated user login
- **Role** - User role in org (admin | member)

## Example: Admin vs Member View

### Admin User View
```
AVRO ITEMS EXPLORER
├── 👤 alice (Role: admin)
├── 📁 Documents
│   ├── 📄 Report.pdf
│   ├── 📄 Notes.txt
│   └── 📄 Admin-Only-Doc.pdf    ← Visible to admin
├── 📁 Actions
│   ├── ⚡ Deploy
│   ├── 🧪 Test
│   └── ⚙️ Admin Settings         ← Visible to admin
└── 📝 System Item
```

### Member User View
```
AVRO ITEMS EXPLORER
├── 👤 bob (Role: member)
├── 📁 Documents
│   ├── 📄 Report.pdf
│   └── 📄 Notes.txt
│   └── 📄 Admin-Only-Doc.pdf    ← Hidden from member
├── 📁 Actions
│   ├── ⚡ Deploy
│   └── 🧪 Test
│   └── ⚙️ Admin Settings         ← Hidden from member
└── 📝 System Item
```

## Configuration

Items can be marked as admin-only by including 'admin-only' in the itemType:

```typescript
// Admin-only item example
new Item(
  'admin-settings',
  'Admin Settings',
  'Configure system settings',
  'admin-only',  // This will be hidden from members
  vscode.TreeItemCollapsibleState.None
);
```

## Implementation Details

### How Filtering Works

```typescript
filterItemsByRole(items: Item[]): Item[] {
  // Admin can see everything
  if (this.userRole === 'admin') {
    return items;
  }

  // Member cannot see admin-only items
  if (this.userRole === 'member') {
    return items.filter(item => !item.itemType?.includes('admin-only'));
  }

  return [];
}
```

### Role Information in ItemsProvider

```typescript
private userRole: 'admin' | 'member' | undefined;

setAuthenticationState(
  isAuthenticated: boolean,
  username?: string,
  role?: 'admin' | 'member'
): void {
  this.isAuthenticated = isAuthenticated;
  this.authenticatedUser = username;
  this.userRole = role;
  this.refresh();
}
```

## Security Considerations

✓ Role retrieved directly from GitHub API
✓ No local role configuration possible (GitHub is source of truth)
✓ Role validated on every authentication
✓ Role updated on each extension load
✓ Invalid credentials trigger automatic re-authentication

## Testing Scenarios

### Test Case 1: Admin Sign-In
1. Click "Sign in to GitHub"
2. Enter organization (avrocc)
3. Enter PAT with `read:org` scope
4. Use account with admin role
5. ✓ See "Role: admin" in user status
6. ✓ See all items including admin-only

### Test Case 2: Member Sign-In
1. Click "Sign in to GitHub"
2. Enter organization (avrocc)
3. Enter PAT with `read:org` scope
4. Use account with member role
5. ✓ See "Role: member" in user status
6. ✓ See standard items only
7. ✗ Admin-only items hidden

### Test Case 3: Role Change
1. Sign in with member account
2. See member items
3. Logout
4. Sign in with admin account
5. ✓ See admin items
6. ✓ Role updates to admin

### Test Case 4: Invalid Token Handling
1. Sign in successfully
2. Manually revoke PAT on GitHub
3. Reload extension
4. ✓ Detects invalid token
5. ✓ Clears storage
6. ✓ Shows sign-in button

## Files Modified

| File | Changes |
|------|---------|
| `src/github/auth.ts` | Returns role in authenticateUser() |
| `src/ui/signInButton.ts` | New GitHub-style sign-in UI |
| `src/utils/secureStorage.ts` | Added role storage methods |
| `src/itemsProvider.ts` | Role-based filtering |
| `src/extension.ts` | Integration with role flow |
| `package.json` | Updated context menus |

## Next Steps

1. **Extend Filtering** - Add more admin-only items as needed
2. **Custom Roles** - Can be extended for fine-grained permissions
3. **Role Sync** - Periodic re-validation of role (optional)
4. **Audit Logging** - Log role changes for security (optional)

## Summary

The role-based access control system provides:
- ✓ GitHub-style sign-in experience
- ✓ User role display with clear indication
- ✓ Automatic item filtering by role
- ✓ Secure role storage and validation
- ✓ Seamless auto-authentication for returning users
- ✓ Easy logout with state reset
