import * as vscode from 'vscode';
import { ItemsProvider, Item } from './itemsProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('TreeView Example extension is now active!');

	// Create the TreeView provider
	const itemsProvider = new ItemsProvider();

	// Register the TreeView
	vscode.window.createTreeView('itemsExplorer', {
		treeDataProvider: itemsProvider,
		showCollapseAll: true,
	});

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
	console.log('TreeView Example extension is now deactivated!');
}
