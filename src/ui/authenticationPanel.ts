import * as vscode from 'vscode';
import { SecureStorage } from '../utils/secureStorage';
import { authenticateUser } from '../github/auth';

export interface AuthPanelMessage {
	type: 'authenticate' | 'cancel';
	org?: string;
	pat?: string;
}

export interface AuthPanelResponse {
	success: boolean;
	user?: string;
	role?: 'admin' | 'member';
	org?: string;
	error?: string;
}

/**
 * WebView panel for GitHub authentication
 */
export class AuthenticationPanel {
	public static currentPanel: AuthenticationPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private storage: SecureStorage;
	private onAuthenticationCallback?: (result: AuthPanelResponse) => void;

	public static createOrShow(
		extensionUri: vscode.Uri,
		storage: SecureStorage,
		onAuthentication?: (result: AuthPanelResponse) => void
	): AuthenticationPanel {
		const column = vscode.ViewColumn.One;

		// If we already have a panel, show it
		if (AuthenticationPanel.currentPanel) {
			AuthenticationPanel.currentPanel._panel.reveal(column);
			if (onAuthentication) {
				AuthenticationPanel.currentPanel.onAuthenticationCallback = onAuthentication;
			}
			return AuthenticationPanel.currentPanel;
		}

		// Otherwise, create a new panel
		const panel = vscode.window.createWebviewPanel(
			'avroAuth',
			'Avro: GitHub Authentication',
			column,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		AuthenticationPanel.currentPanel = new AuthenticationPanel(
			panel,
			extensionUri,
			storage,
			onAuthentication
		);

		return AuthenticationPanel.currentPanel;
	}

	public static kill() {
		AuthenticationPanel.currentPanel?.dispose();
		AuthenticationPanel.currentPanel = undefined;
	}

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		storage: SecureStorage,
		onAuthentication?: (result: AuthPanelResponse) => void
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.storage = storage;
		this.onAuthenticationCallback = onAuthentication;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			(_e) => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			(message: AuthPanelMessage) => this._handleMessage(message),
			null,
			this._disposables
		);
	}

	private async _handleMessage(message: AuthPanelMessage) {
		if (message.type === 'authenticate') {
			const org = message.org?.trim() || 'avrocc';
			const pat = message.pat?.trim();

			if (!pat) {
				this._panel.webview.postMessage({
					type: 'error',
					error: 'Personal Access Token is required'
				});
				return;
			}

			// Show progress
			this._panel.webview.postMessage({ type: 'authenticating' });

			try {
				// Authenticate
				const authResult = await authenticateUser(pat, org, ['admin', 'member']);

				if (authResult.success && authResult.user && authResult.role) {
					// Store credentials
					await this.storage.storePAT(pat);
					await this.storage.storeOrganization(org);
					await this.storage.storeUser(authResult.user.login);
					await this.storage.storeRole(authResult.role);

					const response: AuthPanelResponse = {
						success: true,
						user: authResult.user.login,
						role: authResult.role,
						org: org
					};

					this._panel.webview.postMessage({
						type: 'success',
						data: response
					});

					if (this.onAuthenticationCallback) {
						this.onAuthenticationCallback(response);
					}

					// Close panel after successful auth
					setTimeout(() => this.dispose(), 1500);
				} else {
					this._panel.webview.postMessage({
						type: 'error',
						error: authResult.error || 'Authentication failed'
					});
				}
			} catch (error) {
				this._panel.webview.postMessage({
					type: 'error',
					error: error instanceof Error ? error.message : 'Unknown error'
				});
			}
		} else if (message.type === 'cancel') {
			this.dispose();
		}
	}

	private _update() {
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview): string {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>GitHub Authentication</title>
	<style>
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 100vh;
			padding: 20px;
		}

		.container {
			width: 100%;
			max-width: 500px;
		}

		.panel {
			background-color: var(--vscode-sideBar-background);
			border: 1px solid var(--vscode-sideBar-border);
			border-radius: 8px;
			padding: 40px;
		}

		.header {
			text-align: center;
			margin-bottom: 40px;
		}

		.header h1 {
			font-size: 32px;
			font-weight: 600;
			margin-bottom: 16px;
			color: var(--vscode-editor-foreground);
			letter-spacing: -0.5px;
		}

		.header p {
			font-size: 15px;
			color: var(--vscode-descriptionForeground);
			line-height: 1.6;
			font-weight: 400;
		}

		.form-group {
			margin-bottom: 24px;
		}

		label {
			display: block;
			font-size: 13px;
			font-weight: 600;
			margin-bottom: 8px;
			color: var(--vscode-editor-foreground);
			letter-spacing: 0.3px;
		}

		input {
			width: 100%;
			padding: 10px 12px;
			font-size: 13px;
			border: 1px solid var(--vscode-input-border);
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			border-radius: 6px;
			font-family: inherit;
			transition: border-color 0.2s, box-shadow 0.2s;
		}

		input:focus {
			outline: none;
			border-color: #238636;
			box-shadow: 0 0 0 3px rgba(36, 134, 54, 0.15);
		}

		input::placeholder {
			color: var(--vscode-input-placeholderForeground);
		}

		.help-text {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			margin-top: 4px;
			line-height: 1.4;
		}

		.button-group {
			display: flex;
			gap: 12px;
			margin-top: 32px;
		}

		button {
			flex: 1;
			padding: 12px 24px;
			font-size: 14px;
			font-weight: 600;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			transition: all 0.2s;
			font-family: inherit;
			letter-spacing: 0.3px;
		}

		.btn-primary {
			background-color: #238636;
			color: white;
		}

		.btn-primary:hover {
			background-color: #2ea043;
			box-shadow: 0 2px 8px rgba(36, 134, 54, 0.3);
		}

		.btn-primary:active {
			background-color: #1a6e2f;
		}

		.btn-primary:disabled {
			background-color: #6e7681;
			cursor: not-allowed;
			opacity: 0.6;
		}

		.btn-secondary {
			background-color: transparent;
			color: var(--vscode-editor-foreground);
			border: 1px solid var(--vscode-input-border);
		}

		.btn-secondary:hover {
			background-color: rgba(255, 255, 255, 0.05);
			border-color: var(--vscode-focusBorder);
		}

		.status {
			display: none;
			padding: 12px;
			border-radius: 6px;
			font-size: 13px;
			margin-bottom: 20px;
			text-align: center;
		}

		.status.show {
			display: block;
		}

		.status.success {
			background-color: rgba(3, 102, 214, 0.1);
			color: #0366d6;
			border: 1px solid rgba(3, 102, 214, 0.3);
		}

		.status.error {
			background-color: rgba(207, 34, 46, 0.1);
			color: #cb2431;
			border: 1px solid rgba(207, 34, 46, 0.3);
		}

		.status.info {
			background-color: rgba(85, 85, 85, 0.1);
			color: var(--vscode-editor-foreground);
			border: 1px solid rgba(85, 85, 85, 0.3);
		}

		.spinner {
			display: inline-block;
			width: 14px;
			height: 14px;
			border: 2px solid rgba(255, 255, 255, 0.3);
			border-radius: 50%;
			border-top-color: white;
			animation: spin 0.8s linear infinite;
			margin-right: 8px;
			vertical-align: middle;
		}

		@keyframes spin {
			to { transform: rotate(360deg); }
		}

		.info-box {
			background-color: rgba(54, 109, 217, 0.08);
			border-left: 4px solid #238636;
			padding: 12px 16px;
			border-radius: 6px;
			margin-bottom: 28px;
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			line-height: 1.6;
		}

		.info-box strong {
			color: var(--vscode-editor-foreground);
			font-weight: 600;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="panel">
			<div class="header">
				<h1>Sign in to GitHub</h1>
				<p>Authenticate with your GitHub Personal Access Token to access Avro features</p>
			</div>

			<div id="status" class="status"></div>

			<div class="info-box">
				<strong>Need a token?</strong> Create one at <strong>github.com/settings/tokens</strong> with <strong>read:org</strong> scope
			</div>

			<form id="authForm">
				<div class="form-group">
					<label for="org">Organization Name</label>
					<input
						type="text"
						id="org"
						name="org"
						placeholder="e.g., avrocc"
						value="avrocc"
						required
					/>
					<div class="help-text">The GitHub organization to authenticate with</div>
				</div>

				<div class="form-group">
					<label for="pat">Personal Access Token</label>
					<input
						type="password"
						id="pat"
						name="pat"
						placeholder="ghp_..."
						required
					/>
					<div class="help-text">Your GitHub PAT will be stored securely</div>
				</div>

				<div class="button-group">
					<button type="submit" class="btn-primary" id="submitBtn">Sign in to GitHub</button>
					<button type="button" class="btn-secondary" id="cancelBtn">Cancel</button>
				</div>
			</form>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		const form = document.getElementById('authForm');
		const status = document.getElementById('status');
		const submitBtn = document.getElementById('submitBtn');
		const cancelBtn = document.getElementById('cancelBtn');

		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			const org = document.getElementById('org').value.trim();
			const pat = document.getElementById('pat').value.trim();

			if (!org || !pat) {
				showStatus('Please fill in all fields', 'error');
				return;
			}

			submitBtn.disabled = true;
			vscode.postMessage({
				type: 'authenticate',
				org,
				pat
			});
		});

		cancelBtn.addEventListener('click', () => {
			vscode.postMessage({ type: 'cancel' });
		});

		window.addEventListener('message', (event) => {
			const message = event.data;

			if (message.type === 'authenticating') {
				showStatus('<span class="spinner"></span>Authenticating...', 'info');
				submitBtn.disabled = true;
			} else if (message.type === 'success') {
				showStatus('✓ Authentication successful!', 'success');
				submitBtn.disabled = true;
			} else if (message.type === 'error') {
				showStatus(message.error || 'Authentication failed', 'error');
				submitBtn.disabled = false;
			}
		});

		function showStatus(message, type) {
			status.innerHTML = message;
			status.className = 'status show ' + type;
		}

		// Focus on PAT input
		window.addEventListener('load', () => {
			document.getElementById('pat').focus();
		});
	</script>
</body>
</html>`;
	}

	public dispose() {
		AuthenticationPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
