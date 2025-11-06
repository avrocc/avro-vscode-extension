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
 * Provides detailed error messages based on authentication failure reasons
 */
function getDetailedErrorMessage(error: string | undefined, org: string, pat: string): string {
	const baseError = error || 'Authentication failed';
	
	if (baseError.includes('401') || baseError.includes('Unauthorized')) {
		return `Invalid Personal Access Token. Please verify your PAT is correct and has read:org scope.\n\nDetails: ${baseError}`;
	}
	
	if (baseError.includes('404') || baseError.includes('Not Found')) {
		return `Organization "${org}" not found or you don't have access to it.\n\nDetails: ${baseError}`;
	}
	
	if (baseError.includes('403') || baseError.includes('Forbidden')) {
		return `Access denied. Your PAT may not have the required "read:org" scope.\n\nDetails: ${baseError}`;
	}
	
	if (baseError.includes('timeout') || baseError.includes('ECONNREFUSED')) {
		return `Network error: Unable to connect to GitHub. Please check your internet connection.\n\nDetails: ${baseError}`;
	}
	
	if (baseError.includes('membership') || baseError.includes('member')) {
		return `You are not a member of the "${org}" organization.\n\nDetails: ${baseError}`;
	}
	
	return `${baseError}\n\nTroubleshooting:\n• Verify your PAT has "read:org" scope\n• Check the organization name is correct: "${org}"\n• Ensure your PAT is still valid (not expired)`;
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
		const errorDetails = getDetailedErrorMessage(result.error, org, pat);
		return {
			success: false,
			error: errorDetails
		};
	}

	if (!result.user) {
		return {
			success: false,
			error: 'No user information returned from GitHub API'
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
