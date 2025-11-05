import * as vscode from 'vscode';

const PAT_STORAGE_KEY = 'github-pat';
const ORG_STORAGE_KEY = 'github-org';
const USER_STORAGE_KEY = 'github-user';
const ROLE_STORAGE_KEY = 'github-role';

/**
 * Securely stores GitHub PAT and user information in VSCode's secure storage
 */
export class SecureStorage {
	private context: vscode.ExtensionContext;
	private secrets: vscode.SecretStorage;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.secrets = context.secrets;
	}

	/**
	 * Store GitHub PAT securely
	 */
	async storePAT(pat: string): Promise<void> {
		await this.secrets.store(PAT_STORAGE_KEY, pat);
	}

	/**
	 * Retrieve stored GitHub PAT
	 */
	async getPAT(): Promise<string | undefined> {
		return await this.secrets.get(PAT_STORAGE_KEY);
	}

	/**
	 * Store GitHub organization name
	 */
	async storeOrganization(org: string): Promise<void> {
		await this.context.globalState.update(ORG_STORAGE_KEY, org);
	}

	/**
	 * Retrieve stored GitHub organization
	 */
	async getOrganization(): Promise<string | undefined> {
		return this.context.globalState.get<string>(ORG_STORAGE_KEY);
	}

	/**
	 * Store authenticated user information
	 */
	async storeUser(username: string): Promise<void> {
		await this.context.globalState.update(USER_STORAGE_KEY, username);
	}

	/**
	 * Retrieve stored user information
	 */
	async getUser(): Promise<string | undefined> {
		return this.context.globalState.get<string>(USER_STORAGE_KEY);
	}

	/**
	 * Store user role in organization
	 */
	async storeRole(role: string): Promise<void> {
		await this.context.globalState.update(ROLE_STORAGE_KEY, role);
	}

	/**
	 * Retrieve stored user role
	 */
	async getRole(): Promise<string | undefined> {
		return this.context.globalState.get<string>(ROLE_STORAGE_KEY);
	}

	/**
	 * Clear all stored authentication data
	 */
	async clearAll(): Promise<void> {
		await this.secrets.delete(PAT_STORAGE_KEY);
		await this.context.globalState.update(ORG_STORAGE_KEY, undefined);
		await this.context.globalState.update(USER_STORAGE_KEY, undefined);
		await this.context.globalState.update(ROLE_STORAGE_KEY, undefined);
	}

	/**
	 * Check if user is authenticated
	 */
	async isAuthenticated(): Promise<boolean> {
		const pat = await this.getPAT();
		const user = await this.getUser();
		return !!pat && !!user;
	}
}
