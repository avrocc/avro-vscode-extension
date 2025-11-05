import * as vscode from 'vscode';

export class Item extends vscode.TreeItem {
	constructor(
		public readonly id: string,
		public readonly label: string,
		public readonly description: string,
		public readonly itemType: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
		public readonly children?: Item[]
	) {
		super(label, collapsibleState);
		this.description = description;
		this.contextValue = itemType; // 'folder', 'file', 'action', etc.
		this.tooltip = `${label}: ${description}`;
		
		// Set icons based on item type
		if (itemType === 'folder') {
			this.iconPath = new vscode.ThemeIcon('folder');
		} else if (itemType === 'file') {
			this.iconPath = new vscode.ThemeIcon('file');
		} else if (itemType === 'action') {
			this.iconPath = new vscode.ThemeIcon('symbol-event');
		} else {
			this.iconPath = new vscode.ThemeIcon('circle-filled');
		}
	}
}

export class ItemsProvider implements vscode.TreeDataProvider<Item> {
	private _onDidChangeTreeData: vscode.EventEmitter<Item | undefined | null | void> =
		new vscode.EventEmitter<Item | undefined | null | void>();
	readonly onDidChangeTreeData: vscode.Event<Item | undefined | null | void> =
		this._onDidChangeTreeData.event;

	private items: Map<string, Item> = new Map();

	constructor() {
		// Initialize with hierarchical items
		const folder1 = new Item(
			'folder-1', 
			'Documents', 
			'Folder with files',
			'folder',
			vscode.TreeItemCollapsibleState.Collapsed,
			[
				new Item('file-1', 'Report.pdf', 'PDF document', 'file'),
				new Item('file-2', 'Notes.txt', 'Text file', 'file')
			]
		);
		
		const folder2 = new Item(
			'folder-2', 
			'Actions', 
			'Available actions',
			'folder',
			vscode.TreeItemCollapsibleState.Collapsed,
			[
				new Item('action-1', 'Deploy', 'Deploy to production', 'action'),
				new Item('action-2', 'Test', 'Run tests', 'action')
			]
		);
		
		this.items.set('folder-1', folder1);
		this.items.set('folder-2', folder2);
		this.items.set('item-3', new Item('item-3', 'Simple Item', 'Single item', 'item'));
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Item): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Item): Thenable<Item[]> {
		if (element) {
			// Return children if they exist
			return Promise.resolve(element.children || []);
		}
		// Return root items
		return Promise.resolve(Array.from(this.items.values()));
	}

	deleteItem(id: string): void {
		this.items.delete(id);
	}

	addItem(id: string, label: string, description: string, itemType: string): void {
		this.items.set(id, new Item(id, label, description, itemType));
		this.refresh();
	}
}
