# GitHub Authentication Feature

This document describes the GitHub authentication feature for the Avro VSCode extension, which provides secure role-based access control using GitHub Personal Access Tokens (PAT).

## Overview

The authentication system validates GitHub PATs and verifies user roles within a GitHub organization. This ensures only authorized organization members can use the extension.

## Features

### 1. PAT Validation
- Makes a GET request to `https://api.github.com/user` with the provided PAT
- Returns HTTP 200 with user information if valid
- Returns HTTP 401 if the PAT is invalid or expired
- Handles network errors gracefully

### 2. User Role Verification
- Uses GitHub API endpoint: `GET https://api.github.com/orgs/{org}/memberships/{username}`
- Verifies user has required role(s) in the target organization
- Supports roles: `admin`, `member`
- Checks membership state is `active` (not pending)
- PAT must have `read:org` or `admin:org` scope

### 3. Secure Storage
- Stores PAT securely using VSCode's built-in `SecretStorage` API
- Stores organization name and username in workspace state
- Sensitive credentials are not logged or exposed
- Supports logout and credential clearing

### 4. Authentication Workflow
1. User runs `Avro: Authenticate with GitHub` command
2. Extension prompts for organization name
3. Extension prompts for GitHub PAT (password field)
4. PAT is validated against GitHub API
5. User's role in organization is verified
6. Credentials are stored securely on success
7. User is notified of authentication status

## Commands

### Authenticate with GitHub
**Command ID:** `avro.authenticate`  
**Keyboard Shortcut:** `Ctrl+Shift+G`  
**Description:** Opens the authentication dialog to log in with GitHub PAT

### Logout
**Command ID:** `avro.logout`  
**Description:** Clears stored credentials and logs out the user

### Show Items Panel
**Command ID:** `avro.showPanel`  
**Keyboard Shortcut:** `Ctrl+Shift+A`  
**Description:** Shows the Avro Items Explorer panel

## Configuration

The extension provides the following configuration options:

```jsonc
{
  // GitHub organization name for role-based access control
  "avro.github.organization": "",
  
  // Required GitHub organization roles for access
  "avro.github.requiredRoles": ["member"],
  
  // Enable/disable GitHub authentication
  "avro.authentication.enabled": true
}
```

## API Reference

### Core Functions

#### `validatePAT(pat: string)`
Validates a GitHub Personal Access Token by checking the `/user` endpoint.

**Parameters:**
- `pat` (string): GitHub Personal Access Token

**Returns:** `Promise<AuthenticationResult>`
- `success` (boolean): Whether validation succeeded
- `user` (GitHubUser?): User information if valid
- `error` (string?): Error message if validation failed
- `errorCode` (string?): Error code (401, NETWORK_ERROR, etc.)

**Example:**
```typescript
const result = await validatePAT('ghp_your_token_here');
if (result.success) {
  console.log(`User: ${result.user.login}`);
}
```

#### `verifyUserRole(pat, org, username, requiredRoles?)`
Verifies if a user has the required role in an organization.

**Parameters:**
- `pat` (string): GitHub Personal Access Token
- `org` (string): Organization name
- `username` (string): GitHub username
- `requiredRoles` (string[]): Array of required roles (default: ['member'])

**Returns:** `Promise<RoleVerificationResult>`
- `success` (boolean): Whether the API call succeeded
- `hasAccess` (boolean): Whether user has required role and is active
- `membership` (GitHubOrgMembership?): Membership details
- `error` (string?): Error message if any

**Example:**
```typescript
const result = await verifyUserRole(pat, 'myorg', 'john', ['admin', 'member']);
if (result.hasAccess) {
  console.log('User has access!');
}
```

#### `authenticateUser(pat, org, requiredRoles?)`
Complete authentication workflow combining validation and role verification.

**Parameters:**
- `pat` (string): GitHub Personal Access Token
- `org` (string): Organization name
- `requiredRoles` (string[]): Array of required roles (default: ['member'])

**Returns:** `Promise<{ success, user?, error? }>`

**Example:**
```typescript
const result = await authenticateUser(pat, 'myorg', ['member']);
if (result.success) {
  console.log(`Authenticated as ${result.user.login}`);
}
```

### UI Functions

#### `showAuthenticationDialog(storage, defaultOrg?)`
Shows the authentication dialog for user input.

**Parameters:**
- `storage` (SecureStorage): Secure storage instance
- `defaultOrg` (string?): Pre-fill organization name

**Returns:** `Promise<AuthenticationDialogResult>`
- `success` (boolean): Whether authentication succeeded
- `pat` (string?): The PAT if successful
- `org` (string?): The organization if successful
- `username` (string?): The authenticated username
- `error` (string?): Error message if failed

#### `showLogoutDialog()`
Shows logout confirmation dialog.

**Returns:** `Promise<boolean>` - True if user confirmed logout

#### `showAuthenticationStatus(isAuthenticated, username?, org?)`
Shows current authentication status.

**Parameters:**
- `isAuthenticated` (boolean): Whether user is authenticated
- `username` (string?): GitHub username
- `org` (string?): Organization name

### Secure Storage

#### `SecureStorage` Class

Methods:
- `storePAT(pat: string)` - Store PAT securely
- `getPAT()` - Retrieve stored PAT
- `storeOrganization(org: string)` - Store organization name
- `getOrganization()` - Retrieve stored organization
- `storeUser(username: string)` - Store username
- `getUser()` - Retrieve stored username
- `clearAll()` - Clear all stored data
- `isAuthenticated()` - Check if user is authenticated

## Error Handling

### HTTP Status Codes

| Status | Meaning | Handling |
|--------|---------|----------|
| 200 | Success | User information returned |
| 401 | Unauthorized | PAT is invalid or expired |
| 403 | Forbidden | Insufficient permissions (missing org scopes) |
| 404 | Not Found | User not member of organization |

### Error Codes

- `NETWORK_ERROR` - Network connectivity issue
- `PARSE_ERROR` - Failed to parse JSON response
- `TIMEOUT` - Request took too long

## PAT Requirements

### Scopes Required for Classic PATs
To use this extension, your PAT must have the following scopes:
- `read:org` - Read organization information
- OR `admin:org` - Full organization administration

### Creating a GitHub PAT

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Avro VSCode Extension")
4. Select required scopes:
   - Check `read:org` or `admin:org`
   - Other scopes as needed for your use case
5. Click "Generate token"
6. Copy the token immediately (you won't see it again)
7. Use the token with the `Avro: Authenticate with GitHub` command

## Security Considerations

### Best Practices

1. **Use Read-Only Scopes**: Use `read:org` instead of `admin:org` when possible
2. **Short Lived Tokens**: Create tokens with limited expiration dates
3. **Rotation**: Periodically rotate your PAT for security
4. **Don't Share**: Never share your PAT with others or commit it to version control
5. **Revoke When Done**: Delete the PAT when you no longer need access

### Storage Security

- PATs are stored in VSCode's secure storage (platform-dependent encryption)
- Credentials are cleared on logout
- PATs are never logged or displayed in plain text
- Network requests use HTTPS only

## Development

### Module Structure

```
src/
├── github/
│   └── auth.ts                 # GitHub API integration
├── ui/
│   └── authenticationDialog.ts # UI components
├── utils/
│   └── secureStorage.ts        # Secure credential storage
├── extension.ts                # Main extension logic
└── itemsProvider.ts            # TreeView provider
```

### Running Tests

```bash
npm run test
```

### Building

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

## Examples

### Example 1: Complete Authentication Flow

```typescript
import { authenticateUser } from './github/auth';

async function authenticate() {
  const result = await authenticateUser(pat, 'myorg', ['member']);
  if (result.success) {
    console.log(`Welcome ${result.user.login}!`);
  } else {
    console.error(`Auth failed: ${result.error}`);
  }
}
```

### Example 2: Manual Role Verification

```typescript
import { validatePAT, verifyUserRole } from './github/auth';

async function checkAccess() {
  // First validate the PAT
  const patResult = await validatePAT(pat);
  if (!patResult.success) {
    console.error('Invalid PAT');
    return;
  }
  
  // Then check their role
  const roleResult = await verifyUserRole(
    pat,
    'myorg',
    patResult.user.login,
    ['admin']
  );
  
  if (roleResult.hasAccess) {
    console.log('User is an admin');
  }
}
```

### Example 3: Using Secure Storage

```typescript
import { SecureStorage } from './utils/secureStorage';

const storage = new SecureStorage(context);

// Store credentials
await storage.storePAT(pat);
await storage.storeOrganization('myorg');
await storage.storeUser('john');

// Retrieve credentials
const storedPat = await storage.getPAT();
const isAuth = await storage.isAuthenticated();

// Clear on logout
await storage.clearAll();
```

## Troubleshooting

### "Invalid Personal Access Token"
- Ensure the PAT is correctly copied (no extra spaces)
- Check if the PAT has expired
- Verify the PAT has the required scopes

### "Insufficient permissions"
- Add `read:org` or `admin:org` scope to your PAT
- Regenerate the token with the correct scopes

### "User is not a member of this organization"
- Verify you're a member of the specified organization
- Check if your membership is active (not pending)
- Ensure the organization name is spelled correctly

### Network errors
- Check your internet connection
- Verify GitHub API is accessible
- Try again after a few seconds

## References

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [User Endpoint](https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user)
- [Organization Memberships Endpoint](https://docs.github.com/en/rest/orgs/members?apiVersion=2022-11-28#get-organization-membership-for-a-user)
- [Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [VSCode SecretStorage API](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)
