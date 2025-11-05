import * as vscode from 'vscode';

export class Item extends vscode.TreeItem {
	constructor(
		public readonly id: string,
		public readonly label: string,
		public readonly description: string,
		public readonly itemType: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None,
		public readonly children?: Item[],
		public readonly isAuthButton?: boolean
	) {
		super(label, collapsibleState);
		this.description = description;
		this.contextValue = itemType; // 'folder', 'file', 'action', 'auth-button', etc.
		this.tooltip = `${label}: ${description}`;
		
		// Set icons based on item type
		if (itemType === 'folder') {
			this.iconPath = new vscode.ThemeIcon('folder');
		} else if (itemType === 'file') {
			this.iconPath = new vscode.ThemeIcon('file');
		} else if (itemType === 'action') {
			this.iconPath = new vscode.ThemeIcon('symbol-event');
		} else if (itemType === 'empty') {
			this.iconPath = new vscode.ThemeIcon('info');
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
	private isAuthenticated = false;
	private authenticatedUser: string | undefined;
	private userRole: 'admin' | 'member' | undefined;

	constructor() {
		this.initializeItems();
	}

	private initializeItems(): void {
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

	/**
	 * Set authentication state with user role
	 */
	setAuthenticationState(isAuthenticated: boolean, username?: string, role?: 'admin' | 'member'): void {
		this.isAuthenticated = isAuthenticated;
		this.authenticatedUser = username;
		this.userRole = role;
		this.refresh();
	}

	/**
	 * Get current user role
	 */
	getUserRole(): 'admin' | 'member' | undefined {
		return this.userRole;
	}

	/**
	 * Check if currently authenticated
	 */
	getAuthenticationState(): boolean {
		return this.isAuthenticated;
	}

	/**
	 * Filter items based on user role
	 */
	private filterItemsByRole(items: Item[]): Item[] {
		// Admin can see everything
		if (this.userRole === 'admin') {
			return items;
		}

		// Member can see most things (filter out admin-only items if needed)
		if (this.userRole === 'member') {
			return items.filter(item => !item.itemType?.includes('admin-only'));
		}

		return [];
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Item): vscode.TreeItem {
		return element;
	}

	getChildren(element?: Item): Thenable<Item[]> {
		if (element) {
			// Return children if they exist, filtered by role
			return Promise.resolve(this.filterItemsByRole(element.children || []));
		}
		
		// If not authenticated, show message to authenticate
		if (!this.isAuthenticated) {
			const emptyItem = new Item(
				'empty-state',
				'Not authenticated',
				'Sign in to GitHub to continue',
				'empty',
				vscode.TreeItemCollapsibleState.None
			);
			emptyItem.command = {
				command: 'avro.authenticate',
				title: 'Authenticate with GitHub'
			};
			return Promise.resolve([emptyItem]);
		}

		// If authenticated, show user info and role-filtered items
		const rootItems: Item[] = [];
		
		// Add authenticated user status item with role
		const userStatus = new Item(
			'user-status',
			`👤 ${this.authenticatedUser || 'Authenticated'}`,
			`Role: ${this.userRole || 'unknown'} | Click to logout`,
			'user-status',
			vscode.TreeItemCollapsibleState.None,
			undefined,
			false
		);
		userStatus.command = {
			command: 'avro.logout',
			title: 'Logout'
		};
		rootItems.push(userStatus);

		// Add role-filtered items
		rootItems.push(...this.filterItemsByRole(Array.from(this.items.values())));
		
		return Promise.resolve(rootItems);
	}

	deleteItem(id: string): void {
		this.items.delete(id);
	}

	addItem(id: string, label: string, description: string, itemType: string): void {
		this.items.set(id, new Item(id, label, description, itemType));
		this.refresh();
	}
}
