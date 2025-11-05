# UI/UX Update: Permission-Based Controls

## What Changed

### 1. Authentication-Based UI State
The extension now shows different content based on authentication state:

#### When NOT Authenticated
- **Single prominent button**: "🔐 Authenticate with GitHub"
- Clicking it opens the authentication dialog
- All other extension features are hidden
- Default organization is pre-filled as `avrocc`

#### When Authenticated
- **User status item**: Shows logged-in username with 👤 icon
- All regular items visible and functional (Documents, Actions, etc.)
- Click user status to logout
- All extension features available

### 2. UI Flow

```
Extension Starts
    ↓
Check Authentication
    ├─ Authenticated & Valid → Show user + features
    ├─ Authenticated & Invalid → Clear + Show auth button
    └─ Not Authenticated → Show auth button only
```

### 3. UI Elements

#### Auth Button (Not Authenticated)
```
🔐 Authenticate with GitHub
  Click to login with your GitHub account (avrocc)
```
- Larger, more visible in the sidebar
- Shows the default organization name
- Direct click triggers authentication

#### User Status (Authenticated)
```
👤 john-doe
  Click to logout
```
- Shows the authenticated username
- Right-click or click to logout
- Placed at top of extension view

### 4. Default Organization
- Organization name defaults to `avrocc`
- Users can still change it during authentication
- Stored for future logins

## User Experience

### First Time User
1. Opens Avro sidebar
2. Sees: "🔐 Authenticate with GitHub"
3. Clicks button
4. Prompted: "Enter GitHub Organization Name" (pre-filled: avrocc)
5. Can press Enter or change to different org
6. Prompted: "Enter GitHub Personal Access Token"
7. On success: User is authenticated, sees all features

### Existing User
1. Opens Avro sidebar
2. Sees: "👤 john-doe" (authenticated)
3. All extension features available
4. Can click user name to logout

## Technical Implementation

### ItemsProvider Changes
- Added `isAuthenticated` and `authenticatedUser` properties
- `setAuthenticationState(isAuthenticated, username?)` method
- `getChildren()` returns different items based on auth state

### Extension.ts Changes
- Sets initial auth state on activation
- Updates auth state after authentication success
- Updates auth state after logout
- Automatically clears invalid credentials

### package.json Changes
- Added context menu for user-status item
- Logout command available from context menu

## Code Changes

### File: src/itemsProvider.ts
```typescript
// New properties
private isAuthenticated = false;
private authenticatedUser: string | undefined;

// New method
setAuthenticationState(isAuthenticated: boolean, username?: string): void {
  this.isAuthenticated = isAuthenticated;
  this.authenticatedUser = username;
  this.refresh();
}

// Updated getChildren() to show auth button when not authenticated
if (!this.isAuthenticated) {
  const authButton = new Item(
    'auth-button',
    '🔐 Authenticate with GitHub',
    'Click to login with your GitHub account (avrocc)',
    'auth-button'
  );
  return Promise.resolve([authButton]);
}
```

### File: src/extension.ts
```typescript
// Initialize auth state
itemsProvider.setAuthenticationState(isUserAuthenticated, storedUser);

// Update on successful auth
itemsProvider.setAuthenticationState(true, result.username);

// Update on logout
itemsProvider.setAuthenticationState(false);
```

### File: src/ui/authenticationDialog.ts
```typescript
// Default org is now 'avrocc'
value: defaultOrg || 'avrocc'
```

## Benefits

✓ **Clear Auth Status** - Users immediately see if they're authenticated
✓ **Hidden Complexity** - Non-authenticated users don't see unused features
✓ **One-Click Auth** - Big button makes authentication discoverable
✓ **Safe Defaults** - avrocc pre-filled for expected users
✓ **Easy Logout** - Click user name or right-click to logout

## Testing

1. Start extension without authentication
   - Should see: "🔐 Authenticate with GitHub"
   - Click button → auth dialog opens
   - org field pre-filled with "avrocc"

2. Complete authentication
   - Should see: "👤 your-username"
   - All items visible (Documents, Actions, etc.)

3. Logout
   - Click user name or right-click → logout
   - Should see: "🔐 Authenticate with GitHub" again

## Files Modified

- `src/itemsProvider.ts` - Added auth state management
- `src/extension.ts` - Updated integration
- `src/ui/authenticationDialog.ts` - Set default org
- `package.json` - Added context menu for logout

## Next Steps

- [ ] Test in development mode (F5)
- [ ] Verify auth button click works
- [ ] Verify user status displays after auth
- [ ] Test logout functionality
- [ ] Test re-authentication flow
