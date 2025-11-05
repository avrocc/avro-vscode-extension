````markdown
# Avro Extension

Official VS Code extension for the Avro platform with custom TreeView explorer and GitHub-based authentication.

## Features

### Authentication & Authorization
- **GitHub PAT Authentication**: Secure login with GitHub Personal Access Tokens
- **Organization Role Verification**: Role-based access control via GitHub organization membership
- **Secure Credential Storage**: PAT and user info stored securely using VSCode's SecretStorage
- **Keyboard Shortcut**: `Ctrl+Shift+G` to authenticate

### Extension Features
- **Custom Activity Bar Button**: Dedicated "Avro" button in the sidebar with custom icon
- **Hierarchical TreeView**: Organized folders with nested items:
  - 📁 Documents folder with 3 file items
  - 📁 Actions folder with Deploy and Test actions
- **Context Menu Actions**:
  - **Open Item**: Opens/displays the selected item
  - **Edit Item**: Edit file items
  - **Delete Item**: Delete items with confirmation
  - **Execute Action**: Run Deploy/Test actions
- **Keyboard Shortcut**: `Ctrl+Shift+A` to show Avro panel
- **Refresh Button**: Refresh the items tree

## Quick Start

### Authentication
1. Press `Ctrl+Shift+G` (or run `Avro: Authenticate with GitHub`)
2. Enter your GitHub organization name
3. Paste your GitHub Personal Access Token
4. You're authenticated!

See [AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md) for detailed instructions.

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press `F5` to open a new VS Code window with the extension loaded

## Development

### Prerequisites
- Node.js 14+
- VS Code 1.85+

### Commands

- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch for TypeScript changes
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Extension Structure

```
├── src/
│   ├── extension.ts                    # Main extension entry point
│   ├── itemsProvider.ts                # TreeView provider implementation
│   ├── github/
│   │   └── auth.ts                     # GitHub authentication & API
│   ├── ui/
│   │   └── authenticationDialog.ts     # Authentication UI components
│   └── utils/
│       └── secureStorage.ts            # Secure credential storage
├── package.json                        # Extension manifest
├── tsconfig.json                       # TypeScript configuration
├── AUTHENTICATION.md                   # Full authentication documentation
├── AUTH_QUICKSTART.md                  # Quick start guide
└── AUTH_EXAMPLES.ts                    # Code examples
```

## How It Works

### Extension Lifecycle
1. Extension activates when VS Code starts
2. Checks if user has stored authentication credentials
3. Validates stored PAT against GitHub API
4. Creates TreeView "Items Explorer" in the sidebar
5. User can now use all extension features if authenticated

### Authentication Flow
1. User runs `Avro: Authenticate with GitHub`
2. Prompted for GitHub organization name
3. Prompted for Personal Access Token (PAT)
4. PAT is validated via `GET /user` endpoint
5. User's role verified via `GET /orgs/{org}/memberships/{username}`
6. On success, credentials stored securely
7. User can logout with `Avro: Logout`

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Avro: Authenticate with GitHub | `Ctrl+Shift+G` | Authenticate using GitHub PAT |
| Avro: Logout | - | Clear stored credentials |
| Avro: Show Items Panel | `Ctrl+Shift+A` | Show the Avro explorer panel |
| Avro: Refresh Items | - | Refresh the items tree |

## Configuration

Configure the extension in VSCode settings:

```json
{
  "avro.github.organization": "myorg",
  "avro.github.requiredRoles": ["member"],
  "avro.authentication.enabled": true
}
```

## Documentation

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete authentication documentation with API reference
- **[AUTH_QUICKSTART.md](./AUTH_QUICKSTART.md)** - Quick start guide for authentication
- **[AUTH_EXAMPLES.ts](./AUTH_EXAMPLES.ts)** - Code examples for developers

## Security

✓ PATs stored securely using VSCode's SecretStorage  
✓ Credentials never logged or displayed  
✓ HTTPS-only communication with GitHub API  
✓ Minimum required permissions approach  
✓ Easy logout and credential clearing

## Adding Custom Items

To add more items, modify the `ItemsProvider` constructor or use the `addItem()` method:

```typescript
itemsProvider.addItem('item-4', 'Item 4', 'Description');
```

## Troubleshooting

### Authentication Issues
- See [AUTHENTICATION.md](./AUTHENTICATION.md#troubleshooting) for detailed troubleshooting

### Build Issues
```bash
npm run lint      # Check for lint errors
npm run compile   # Rebuild from scratch
```

## License

MIT
````
>>>>>>> feature/init
