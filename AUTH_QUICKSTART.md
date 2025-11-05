# Quick Start: GitHub Authentication

Get started with GitHub authentication in the Avro VSCode extension in 3 minutes.

## Prerequisites

- VSCode 1.85 or later
- GitHub account with access to an organization
- GitHub Personal Access Token (PAT)

## Step 1: Create a GitHub PAT

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Fill in the form:
   - **Note**: `Avro VSCode Extension`
   - **Expiration**: 30 days (or as needed)
   - **Scopes**: Select `read:org`
4. Click **"Generate token"**
5. Copy the token (it won't be shown again!)

## Step 2: Authenticate with Extension

1. In VSCode, open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type: `Avro: Authenticate with GitHub`
3. Press Enter

## Step 3: Enter Credentials

The extension will ask for two things:

### Organization Name
```
Enter GitHub Organization Name: myorg
```
Type your GitHub organization name (the one you're a member of).

### Personal Access Token
```
Enter GitHub Personal Access Token (PAT): 
```
Paste your PAT here. It will be hidden as you type.

## Step 4: Verify Success

You should see a success message:
```
✓ Successfully authenticated as john-doe in myorg
```

Your credentials are now securely stored!

## Common Commands

| Command | Shortcut | Purpose |
|---------|----------|---------|
| Avro: Authenticate | `Ctrl+Shift+G` | Login with GitHub PAT |
| Avro: Logout | - | Clear stored credentials |
| Avro: Show Items Panel | `Ctrl+Shift+A` | Show Avro explorer |

## Troubleshooting

### "Invalid or expired Personal Access Token"
- ✓ Verify token was copied correctly
- ✓ Check if token has expired
- ✓ Create a new token with correct scopes

### "User is not a member of this organization"
- ✓ Verify you're a member of the organization
- ✓ Check membership is active (not pending)
- ✓ Spell organization name correctly

### "Insufficient permissions"
- ✓ Regenerate PAT with `read:org` or `admin:org` scope

## What Happens Next?

Once authenticated:
- Your PAT is stored securely
- You can use all extension features
- Your authentication persists between sessions
- You can logout anytime with `Avro: Logout`

## Security Notes

- ✓ PATs are stored securely using VSCode's encryption
- ✓ PATs are never logged or displayed
- ✓ Use `read:org` scope (minimum required permissions)
- ✓ Rotate tokens regularly
- ✓ Delete tokens when no longer needed

## Next Steps

- Read the full [AUTHENTICATION.md](./AUTHENTICATION.md) documentation
- Explore Avro extension features
- Configure settings in VSCode settings UI (`Cmd+,`)

## Support

For issues or questions:
1. Check [AUTHENTICATION.md](./AUTHENTICATION.md) troubleshooting section
2. Review error messages shown in VSCode
3. Check VSCode output panel for details
