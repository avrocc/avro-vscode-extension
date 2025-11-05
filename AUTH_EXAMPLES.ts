// Examples of using the Avro GitHub Authentication API

// ============================================================================
// EXAMPLE 1: Basic PAT Validation
// ============================================================================

import { validatePAT } from './github/auth';

async function example1_validateToken() {
  const pat = 'ghp_your_token_here';
  
  const result = await validatePAT(pat);
  
  if (result.success) {
    console.log(`✓ Token is valid!`);
    console.log(`  User: ${result.user?.login}`);
    console.log(`  ID: ${result.user?.id}`);
  } else {
    console.error(`✗ Token validation failed: ${result.error}`);
    console.error(`  Error code: ${result.errorCode}`);
  }
}

// ============================================================================
// EXAMPLE 2: Verify User Role in Organization
// ============================================================================

import { verifyUserRole } from './github/auth';

async function example2_checkUserRole() {
  const pat = 'ghp_your_token_here';
  const org = 'my-company';
  const username = 'john-doe';
  
  const result = await verifyUserRole(
    pat,
    org,
    username,
    ['admin'] // Only admin role is acceptable
  );
  
  if (result.success) {
    if (result.hasAccess) {
      console.log(`✓ User is admin in ${org}`);
      console.log(`  Role: ${result.membership?.role}`);
      console.log(`  State: ${result.membership?.state}`);
    } else {
      console.log(`✗ User does not have required role`);
      if (result.membership) {
        console.log(`  Current role: ${result.membership.role}`);
        console.log(`  State: ${result.membership.state}`);
      }
    }
  } else {
    console.error(`✗ Role verification failed: ${result.error}`);
  }
}

// ============================================================================
// EXAMPLE 3: Complete Authentication Flow
// ============================================================================

import { authenticateUser } from './github/auth';

async function example3_completeAuth() {
  const pat = 'ghp_your_token_here';
  const org = 'my-company';
  
  // This combines validation and role checking
  const result = await authenticateUser(pat, org, ['member', 'admin']);
  
  if (result.success && result.user) {
    console.log(`✓ Authentication successful!`);
    console.log(`  Authenticated user: ${result.user.login}`);
    console.log(`  Organization: ${org}`);
    console.log(`  Name: ${result.user.name || '(not set)'}`);
  } else {
    console.error(`✗ Authentication failed: ${result.error}`);
  }
}

// ============================================================================
// EXAMPLE 4: Using with SecureStorage
// ============================================================================

import { SecureStorage } from './utils/secureStorage';
import * as vscode from 'vscode';

async function example4_secureStorage(context: vscode.ExtensionContext) {
  const storage = new SecureStorage(context);
  const pat = 'ghp_your_token_here';
  
  // Store credentials securely
  await storage.storePAT(pat);
  await storage.storeOrganization('my-company');
  await storage.storeUser('john-doe');
  
  // Check authentication status
  const isAuthenticated = await storage.isAuthenticated();
  console.log(`Is authenticated: ${isAuthenticated}`);
  
  // Retrieve stored data later
  const storedPat = await storage.getPAT();
  const storedOrg = await storage.getOrganization();
  const storedUser = await storage.getUser();
  
  console.log(`User: ${storedUser} in org ${storedOrg}`);
  
  // Use stored PAT to verify it's still valid
  if (storedPat) {
    const validationResult = await validatePAT(storedPat);
    if (!validationResult.success) {
      console.log('Stored PAT is invalid, clearing storage');
      await storage.clearAll();
    }
  }
}

// ============================================================================
// EXAMPLE 5: Using the Authentication Dialog
// ============================================================================

import { showAuthenticationDialog, showLogoutDialog } from './ui/authenticationDialog';

async function example5_authDialog(context: vscode.ExtensionContext) {
  const storage = new SecureStorage(context);
  
  // Show authentication dialog
  const authResult = await showAuthenticationDialog(storage, 'my-company');
  
  if (authResult.success) {
    console.log(`✓ Logged in as ${authResult.username}`);
    console.log(`  Organization: ${authResult.org}`);
    // Credentials are automatically stored
  } else if (authResult.error !== 'Cancelled') {
    vscode.window.showErrorMessage(`Auth failed: ${authResult.error}`);
  }
  
  // Later, when user wants to logout
  const confirmLogout = await showLogoutDialog();
  if (confirmLogout) {
    await storage.clearAll();
    console.log('User logged out');
  }
}

// ============================================================================
// EXAMPLE 6: Handling Different Error Scenarios
// ============================================================================

import { validatePAT, verifyUserRole } from './github/auth';

async function example6_errorHandling(pat: string) {
  const result = await validatePAT(pat);
  
  switch (result.errorCode) {
    case '401':
      console.error('Invalid or expired PAT');
      console.error('Action: Ask user to create a new token');
      break;
      
    case 'NETWORK_ERROR':
      console.error('Network connectivity issue');
      console.error(`Details: ${result.error}`);
      console.error('Action: Check internet connection, try again');
      break;
      
    case 'PARSE_ERROR':
      console.error('Failed to parse GitHub response');
      console.error('Action: Try again, GitHub API might be experiencing issues');
      break;
      
    case 'TIMEOUT':
      console.error('Request timeout');
      console.error('Action: Try again, GitHub is slow');
      break;
      
    default:
      console.error(`Unknown error: ${result.error}`);
  }
}

// ============================================================================
// EXAMPLE 7: Re-authentication on Demand
// ============================================================================

async function example7_reauth(context: vscode.ExtensionContext, pat: string) {
  const storage = new SecureStorage(context);
  
  // Check if stored credentials are still valid
  const isAuth = await storage.isAuthenticated();
  const storedPat = await storage.getPAT();
  
  if (isAuth && storedPat) {
    const result = await validatePAT(storedPat);
    
    if (!result.success) {
      console.log('Stored PAT is no longer valid');
      
      // Clear old credentials
      await storage.clearAll();
      
      // Ask user to re-authenticate
      const reAuthResult = await showAuthenticationDialog(storage);
      
      if (reAuthResult.success) {
        console.log('Re-authentication successful');
      }
    }
  }
}

// ============================================================================
// EXAMPLE 8: Batch Verification of Multiple Users
// ============================================================================

import { verifyUserRole } from './github/auth';

async function example8_batchVerify(
  pat: string,
  org: string,
  users: string[]
) {
  const results = await Promise.all(
    users.map(username =>
      verifyUserRole(pat, org, username, ['member', 'admin'])
    )
  );
  
  const validUsers = results.filter(r => r.hasAccess && r.membership);
  console.log(`${validUsers.length} of ${users.length} users are members`);
  
  results.forEach((result, index) => {
    const user = users[index];
    if (result.hasAccess && result.membership) {
      console.log(`✓ ${user}: ${result.membership.role}`);
    } else {
      console.log(`✗ ${user}: no access`);
    }
  });
}

// ============================================================================
// EXAMPLE 9: Caching and Periodic Re-validation
// ============================================================================

class AuthCache {
  private cache: Map<string, { valid: boolean; timestamp: number }> = new Map();
  private cacheExpiry = 1000 * 60 * 60; // 1 hour
  
  async validateWithCache(pat: string): Promise<boolean> {
    const cached = this.cache.get(pat);
    const now = Date.now();
    
    if (cached && now - cached.timestamp < this.cacheExpiry) {
      return cached.valid;
    }
    
    const result = await validatePAT(pat);
    this.cache.set(pat, {
      valid: result.success,
      timestamp: now
    });
    
    return result.success;
  }
  
  invalidate(pat: string) {
    this.cache.delete(pat);
  }
  
  clear() {
    this.cache.clear();
  }
}

// ============================================================================
// EXAMPLE 10: Integration with Extension Commands
// ============================================================================

import * as vscode from 'vscode';
import { SecureStorage } from './utils/secureStorage';
import { showAuthenticationDialog } from './ui/authenticationDialog';
import { authenticateUser } from './github/auth';

async function example10_extensionIntegration(
  context: vscode.ExtensionContext
) {
  const storage = new SecureStorage(context);
  
  // Command: Initialize extension with auth check
  context.subscriptions.push(
    vscode.commands.registerCommand('myExtension.init', async () => {
      const isAuth = await storage.isAuthenticated();
      
      if (!isAuth) {
        const result = await showAuthenticationDialog(storage);
        if (!result.success) {
          vscode.window.showErrorMessage(
            'Authentication required to use this extension'
          );
          return;
        }
      }
      
      // Proceed with extension functionality
      vscode.window.showInformationMessage('Extension initialized!');
    })
  );
  
  // Command: Verify current authentication
  context.subscriptions.push(
    vscode.commands.registerCommand('myExtension.checkAuth', async () => {
      const pat = await storage.getPAT();
      const user = await storage.getUser();
      const org = await storage.getOrganization();
      
      if (!pat || !user) {
        vscode.window.showWarningMessage('Not authenticated');
        return;
      }
      
      const result = await authenticateUser(pat, org || '');
      
      if (result.success) {
        vscode.window.showInformationMessage(
          `✓ Authenticated as ${user} in ${org}`
        );
      } else {
        vscode.window.showErrorMessage(
          `✗ Authentication check failed: ${result.error}`
        );
      }
    })
  );
}

// ============================================================================
// Export examples for testing
// ============================================================================

export {
  example1_validateToken,
  example2_checkUserRole,
  example3_completeAuth,
  example4_secureStorage,
  example5_authDialog,
  example6_errorHandling,
  example7_reauth,
  example8_batchVerify,
  AuthCache
};
