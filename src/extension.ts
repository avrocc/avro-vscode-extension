import * as vscode from 'vscode';
import { ItemsProvider, Item } from './itemsProvider';
import { SecureStorage } from './utils/secureStorage';
import { validatePAT, authenticateUser } from './github/auth';
import { showAuthenticationDialog } from './ui/authenticationDialog';

let secureStorage: SecureStorage;
let isUserAuthenticated = false;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Avro extension is now active!');

	// Initialize secure storage
	secureStorage = new SecureStorage(context);

	// Check if user is already authenticated
	const isAuthenticated = await secureStorage.isAuthenticated();
	const storedUser = await secureStorage.getUser();
	const storedOrg = await secureStorage.getOrganization();
	const storedRole = await secureStorage.getRole();

	if (isAuthenticated && storedUser) {
		// Verify stored PAT is still valid
		const pat = await secureStorage.getPAT();
		if (pat) {
			const result = await validatePAT(pat);
			if (result.success) {
				isUserAuthenticated = true;
				console.log(`User ${storedUser} is already authenticated as ${storedRole}`);
				vscode.window.showInformationMessage(
					`✓ Avro: Authenticated as ${storedUser}${storedRole ? ` (${storedRole})` : ''}`
				);
			} else {
				// PAT is invalid, clear storage
				await secureStorage.clearAll();
				console.log('Stored PAT is invalid, cleared storage');
				vscode.window.showWarningMessage('✗ Avro: Stored authentication token is invalid. Please re-authenticate.');
			}
		}
	}

	// Create the TreeView provider
	const itemsProvider = new ItemsProvider();
	
	// Set initial authentication state with role
	itemsProvider.setAuthenticationState(isUserAuthenticated, storedUser, storedRole as 'admin' | 'member' | undefined);

	// Register the TreeView
	vscode.window.createTreeView('itemsExplorer', {
		treeDataProvider: itemsProvider,
		showCollapseAll: true,
	});

	// Register authentication command
	context.subscriptions.push(
		vscode.commands.registerCommand('avro.authenticate', async () => {
			// Show authentication dialog (quick input)
			const result = await showAuthenticationDialog(secureStorage, storedOrg);

			if (result.success && result.username) {
				// Get the role from storage (it was stored during authenticateUser)
				const role = await secureStorage.getRole();
				
				isUserAuthenticated = true;
				const message = `✓ Successfully authenticated as ${result.username}${role ? ` (${role})` : ''}`;
				vscode.window.showInformationMessage(message);
				console.log(message);
				// Update ItemsProvider with authentication state and role
				itemsProvider.setAuthenticationState(true, result.username, role as 'admin' | 'member' | undefined);
			} else if (result.error && result.error !== 'Cancelled') {
				// Show error notification for failed authentication with details
				const errorMessage = `✗ Avro: ${result.error}`;
				const action = await vscode.window.showErrorMessage(
					errorMessage,
					'Retry',
					'Troubleshoot',
					'Dismiss'
				);
				
				if (action === 'Retry') {
					// Trigger authentication again
					vscode.commands.executeCommand('avro.authenticate');
				} else if (action === 'Troubleshoot') {
					// Open GitHub token settings
					vscode.env.openExternal(vscode.Uri.parse('https://github.com/settings/tokens'));
				}
				console.error(errorMessage);
			}
		})
	);

	// Register logout command
	context.subscriptions.push(
		vscode.commands.registerCommand('avro.logout', async () => {
			const username = await secureStorage.getUser();
			await secureStorage.clearAll();
			isUserAuthenticated = false;
			const message = `✓ Avro: Logged out${username ? ` (${username})` : ''}`;
			vscode.window.showInformationMessage(message);
			console.log(message);
			// Update ItemsProvider to show sign-in button
			itemsProvider.setAuthenticationState(false);
		})
	);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('itemsExplorer.refreshItems', () => {
			itemsProvider.refresh();
			vscode.window.showInformationMessage('Items refreshed!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('itemsExplorer.openItem', (item: Item) => {
			vscode.window.showInformationMessage(`Opening item: ${item.label}`);
			// You can add custom logic here, e.g., open a file or show details
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('itemsExplorer.editItem', (item: Item) => {
			vscode.window.showInformationMessage(`Editing item: ${item.label}`);
			// You can add custom logic here, e.g., open an input dialog
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('itemsExplorer.deleteItem', (item: Item) => {
			vscode.window.showWarningMessage(
				`Delete item: ${item.label}?`,
				'Yes',
				'No'
			).then(result => {
				if (result === 'Yes') {
					vscode.window.showInformationMessage(`Item ${item.label} deleted!`);
					itemsProvider.deleteItem(item.id);
					itemsProvider.refresh();
				}
			});
		})
	);

	// Avro button command
	context.subscriptions.push(
		vscode.commands.registerCommand('avro.showPanel', () => {
			vscode.commands.executeCommand('itemsExplorer.focus');
			vscode.window.showInformationMessage('Welcome to Avro Items Explorer!');
		})
	);

	// Execute action command
	context.subscriptions.push(
		vscode.commands.registerCommand('itemsExplorer.executeAction', (item: Item) => {
			vscode.window.showInformationMessage(`Executing action: ${item.label}`);
			// Add your custom action logic here
			if (item.label === 'Deploy') {
				vscode.window.showInformationMessage('🚀 Deploying to production...');
			} else if (item.label === 'Test') {
				vscode.window.showInformationMessage('🧪 Running tests...');
			}
		})
	);
}

export function deactivate() {
	console.log('Avro extension is now deactivated!');
}
