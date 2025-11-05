import * as vscode from 'vscode';

/**
 * Creates and shows a WebView with a GitHub-style sign-in button
 */
export async function showSignInWebView(context: vscode.ExtensionContext): Promise<boolean> {
	const panel = vscode.window.createWebviewPanel(
		'avroSignIn',
		'Avro - Sign in to GitHub',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	// Generate HTML with GitHub-style button
	panel.webview.html = getWebViewContent();

	// Handle messages from WebView
	const result = await new Promise<boolean>((resolve) => {
		const messageListener = panel.webview.onDidReceiveMessage((message) => {
			if (message.command === 'signIn') {
				messageListener.dispose();
				resolve(true);
			} else if (message.command === 'cancel') {
				messageListener.dispose();
				resolve(false);
			}
		});
	});

	panel.dispose();
	return result;
}

/**
 * Generate HTML content for the sign-in WebView
 */
function getWebViewContent(): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Avro - Sign in to GitHub</title>
			<style>
				* {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}

				body {
					display: flex;
					justify-content: center;
					align-items: center;
					min-height: 100vh;
					padding: 20px;
					background: var(--vscode-editor-background, #1e1e1e);
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
					color: var(--vscode-foreground, #e0e0e0);
				}

				.container {
					max-width: 500px;
					text-align: center;
				}

				.logo {
					font-size: 48px;
					margin-bottom: 30px;
				}

				h1 {
					font-size: 32px;
					font-weight: 600;
					margin-bottom: 12px;
					color: var(--vscode-foreground, #e0e0e0);
				}

				.subtitle {
					font-size: 16px;
					color: var(--vscode-descriptionForeground, #888);
					margin-bottom: 40px;
					line-height: 1.5;
				}

				.button-group {
					display: flex;
					flex-direction: column;
					gap: 12px;
				}

				.btn {
					padding: 12px 24px;
					font-size: 16px;
					font-weight: 500;
					border: none;
					border-radius: 6px;
					cursor: pointer;
					transition: all 0.2s ease;
					font-family: inherit;
				}

				.btn-primary {
					background: #238636;
					color: #fff;
					padding: 14px 24px;
					font-size: 16px;
					font-weight: 600;
				}

				.btn-primary:hover {
					background: #2ea043;
					box-shadow: 0 2px 12px rgba(35, 134, 54, 0.3);
				}

				.btn-primary:active {
					background: #1a7a2f;
				}

				.btn-secondary {
					background: var(--vscode-button-secondaryBackground, #3e3e42);
					color: var(--vscode-button-secondaryForeground, #cccccc);
				}

				.btn-secondary:hover {
					background: var(--vscode-button-secondaryHoverBackground, #454545);
				}

				.features {
					margin-top: 40px;
					padding-top: 40px;
					border-top: 1px solid var(--vscode-widget-border, #454545);
					text-align: left;
				}

				.features h2 {
					font-size: 14px;
					font-weight: 600;
					margin-bottom: 16px;
					color: var(--vscode-foreground, #e0e0e0);
					text-transform: uppercase;
					letter-spacing: 0.5px;
				}

				.features ul {
					list-style: none;
				}

				.features li {
					padding: 8px 0;
					font-size: 13px;
					color: var(--vscode-descriptionForeground, #888);
					display: flex;
					align-items: center;
				}

				.features li::before {
					content: "✓";
					display: inline-block;
					width: 20px;
					color: #238636;
					font-weight: bold;
					margin-right: 8px;
				}

				.github-icon {
					display: inline-block;
					margin-right: 8px;
				}
			</style>
		</head>
		<body>
			<div class="container">
				<div class="logo">🔐</div>
				
				<h1>Avro Extension</h1>
				<p class="subtitle">
					Sign in with your GitHub account to access Avro's features based on your organization role.
				</p>

				<div class="button-group">
					<button class="btn btn-primary" onclick="signIn()">
						<span class="github-icon">$(github)</span> Sign in to GitHub
					</button>
					<button class="btn btn-secondary" onclick="cancel()">
						Cancel
					</button>
				</div>

				<div class="features">
					<h2>Features</h2>
					<ul>
						<li>Secure authentication with GitHub PAT</li>
						<li>Role-based access control</li>
						<li>Organization membership verification</li>
						<li>Automatic credential storage</li>
					</ul>
				</div>
			</div>

			<script>
				const vscode = acquireVsCodeApi();

				function signIn() {
					vscode.postMessage({
						command: 'signIn'
					});
				}

				function cancel() {
					vscode.postMessage({
						command: 'cancel'
					});
				}
			</script>
		</body>
		</html>
	`;
}
