import * as vscode from 'vscode';

export interface SignInButtonResult {
	clicked: boolean;
	cancelled: boolean;
}

/**
 * Shows a prominent GitHub sign-in button using Quick Pick
 * This provides a more visible, button-like experience
 */
export async function showGitHubSignInButton(): Promise<SignInButtonResult> {
	const result = await vscode.window.showQuickPick(
		[
			{
				label: '$(github) Sign in to GitHub',
				description: 'Authenticate with your GitHub Personal Access Token',
				picked: true
			}
		],
		{
			placeHolder: 'Avro Extension - GitHub Authentication Required',
			matchOnDescription: true,
			matchOnDetail: true,
			canPickMany: false,
			ignoreFocusOut: true
		}
	);

	if (result) {
		return { clicked: true, cancelled: false };
	}

	return { clicked: false, cancelled: true };
}

/**
 * Shows user details with logout option
 */
export async function showUserMenu(
	username: string,
	org: string,
	role: string
): Promise<'logout' | 'cancel'> {
	const result = await vscode.window.showQuickPick(
		[
			{
				label: `$(account) ${username}`,
				description: `Organization: ${org} | Role: ${role}`,
				detail: 'You are authenticated'
			},
			{
				label: '$(sign-out) Logout',
				description: 'Sign out from GitHub'
			}
		],
		{
			placeHolder: 'User Menu',
			canPickMany: false,
			ignoreFocusOut: true
		}
	);

	if (result?.label.includes('Logout')) {
		return 'logout';
	}

	return 'cancel';
}
