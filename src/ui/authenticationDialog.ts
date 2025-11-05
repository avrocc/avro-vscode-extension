import * as vscode from 'vscode';
import { authenticateUser } from '../github/auth';
import { SecureStorage } from '../utils/secureStorage';

export interface AuthenticationDialogResult {
	success: boolean;
	pat?: string;
	org?: string;
	username?: string;
	role?: 'admin' | 'member';
	error?: string;
}

/**
 * Shows authentication dialog for GitHub PAT input
 */
export async function showAuthenticationDialog(
	storage: SecureStorage,
	defaultOrg?: string
): Promise<AuthenticationDialogResult> {
	// Organization is hardcoded to avrocc
	const org = 'avrocc';

	// Ask for PAT
	const pat = await vscode.window.showInputBox({
		prompt: 'Enter GitHub Personal Access Token (PAT)',
		password: true,
		placeHolder: 'ghp_...',
		validateInput: (value) => {
			if (!value.trim()) {
				return 'PAT is required';
			}
			if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
				return 'Invalid PAT format (should start with ghp_ or github_pat_)';
			}
			return null;
		}
	});

	if (!pat) {
		return { success: false, error: 'Cancelled' };
	}

	// Validate and authenticate
	vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: 'Authenticating with GitHub...',
			cancellable: false
		},
		async () => {
			// This is handled separately to allow async operations
			return new Promise<void>((resolve) => {
				resolve();
			});
		}
	);

	const result = await authenticateUser(pat, org, ['admin', 'member']);

	if (!result.success) {
		return {
			success: false,
			error: result.error || 'Authentication failed'
		};
	}

	if (!result.user) {
		return {
			success: false,
			error: 'No user information returned'
		};
	}

	// Step 2: Store credentials and role
	await storage.storePAT(pat);
	await storage.storeOrganization(org);
	await storage.storeUser(result.user.login);
	if (result.role) {
		await storage.storeRole(result.role);
	}

	return {
		success: true,
		pat,
		org,
		username: result.user.login,
		role: result.role
	};
}

/**
 * Shows logout confirmation dialog
 */
export async function showLogoutDialog(): Promise<boolean> {
	const result = await vscode.window.showWarningMessage(
		'Are you sure you want to logout? You will need to re-authenticate to use the extension.',
		{ modal: true },
		'Logout',
		'Cancel'
	);

	return result === 'Logout';
}

/**
 * Shows authentication status message
 */
export async function showAuthenticationStatus(
	isAuthenticated: boolean,
	username?: string,
	org?: string
): Promise<void> {
	if (isAuthenticated && username && org) {
		vscode.window.showInformationMessage(
			`✓ Authenticated as ${username} in organization ${org}`
		);
	} else {
		vscode.window.showInformationMessage(
			'Not authenticated. Please authenticate to use this extension.'
		);
	}
}
