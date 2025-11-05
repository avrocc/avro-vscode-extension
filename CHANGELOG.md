# Changelog

All notable changes to the Avro VSCode Extension will be documented in this file.

## [0.0.2] - 2025-11-06

### Added
- **GitHub Authentication**: Complete GitHub authentication system with Personal Access Token (PAT) validation
- **Role-Based Access Control (RBAC)**: Role verification against GitHub organization memberships
  - Admin role: Full access to all items
  - Member role: Access to standard items only
- **Secure Credential Storage**: PAT stored securely using VSCode SecretStorage API
- **Sidebar Integration**: Authentication directly from the Avro Items Explorer sidebar
  - Click "Not authenticated" to trigger sign-in
  - Single prompt for Personal Access Token entry
  - Organization hardcoded to `avrocc`
- **User Status Display**: Shows authenticated username and role in sidebar
- **Logout Functionality**: Easy logout option from user status item
- **Auto-Validation**: Validates stored credentials on extension startup
- **Item Filtering**: Role-based filtering of items in TreeView explorer

### Changed
- TreeView now shows "Not authenticated" button when user is not signed in
- Authentication flow simplified to single PAT input (organization is hardcoded)
- Items are automatically filtered based on user's GitHub role

### Technical Details
- GitHub API Integration:
  - `GET /user` - Validates PAT and retrieves user information
  - `GET /orgs/{org}/memberships/{username}` - Verifies role in organization
- VSCode APIs Used:
  - SecretStorage for secure PAT storage
  - TreeView for sidebar UI
  - Commands and Keybindings
- Default organization: `avrocc`
- Required scopes: `read:org`

## [0.0.1] - 2025-11-05

### Initial Release
- Basic TreeView explorer for Avro items
- Extension activation on startup
- Item management (add, view, delete)
- Refresh functionality
