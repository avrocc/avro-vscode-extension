export interface GitHubUser {
	login: string;
	id: number;
	name: string | null;
	email: string | null;
}

export interface GitHubOrgMembership {
	url: string;
	role: 'admin' | 'member';
	state: 'active' | 'pending';
	organization_url: string;
}

export interface AuthenticationResult {
	success: boolean;
	user?: GitHubUser;
	error?: string;
	errorCode?: string;
}

export interface RoleVerificationResult {
	success: boolean;
	hasAccess: boolean;
	membership?: GitHubOrgMembership;
	error?: string;
}

/**
 * Validates GitHub Personal Access Token (PAT) by making a GET request to /user endpoint
 * @param pat - GitHub Personal Access Token
 * @returns AuthenticationResult with user info if valid, error if invalid
 */
export async function validatePAT(pat: string): Promise<AuthenticationResult> {
	try {
		const response = await fetch('https://api.github.com/user', {
			method: 'GET',
			headers: {
				'Authorization': `token ${pat}`,
				'User-Agent': 'Avro-VSCode-Extension',
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (response.status === 200) {
			const user = (await response.json()) as GitHubUser;
			return {
				success: true,
				user
			};
		} else if (response.status === 401) {
			return {
				success: false,
				error: 'Invalid or expired Personal Access Token',
				errorCode: '401'
			};
		} else {
			return {
				success: false,
				error: `GitHub API returned status ${response.status}`,
				errorCode: response.status.toString()
			};
		}
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		return {
			success: false,
			error: `Network error: ${errorMessage}`,
			errorCode: 'NETWORK_ERROR'
		};
	}
}

/**
 * Verifies if a user has the required role in a GitHub organization
 * @param pat - GitHub Personal Access Token
 * @param org - Organization name
 * @param username - GitHub username
 * @param requiredRoles - Array of required roles ('admin', 'member')
 * @returns RoleVerificationResult indicating if user has access
 */
export async function verifyUserRole(
	pat: string,
	org: string,
	username: string,
	requiredRoles: ('admin' | 'member')[] = ['member']
): Promise<RoleVerificationResult> {
	try {
		const response = await fetch(`https://api.github.com/orgs/${org}/memberships/${username}`, {
			method: 'GET',
			headers: {
				'Authorization': `token ${pat}`,
				'User-Agent': 'Avro-VSCode-Extension',
				'Accept': 'application/vnd.github.v3+json'
			}
		});

		if (response.status === 200) {
			const membership = (await response.json()) as GitHubOrgMembership;
			
			// Check if user is in required roles and is active
			const hasRequiredRole = requiredRoles.includes(membership.role);
			const isActive = membership.state === 'active';
			const hasAccess = hasRequiredRole && isActive;

			return {
				success: true,
				hasAccess,
				membership
			};
		} else if (response.status === 404) {
			return {
				success: true,
				hasAccess: false,
				error: 'User is not a member of this organization'
			};
		} else if (response.status === 401) {
			return {
				success: false,
				hasAccess: false,
				error: 'Invalid Personal Access Token or insufficient permissions'
			};
		} else if (response.status === 403) {
			return {
				success: false,
				hasAccess: false,
				error: 'Insufficient permissions. PAT must have read:org or admin:org scope'
			};
		} else {
			return {
				success: false,
				hasAccess: false,
				error: `GitHub API returned status ${response.status}`
			};
		}
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unknown error';
		return {
			success: false,
			hasAccess: false,
			error: `Network error: ${errorMessage}`
		};
	}
}

/**
 * Complete authentication workflow:
 * 1. Validates PAT
 * 2. Verifies user role in organization
 * 3. Returns success only if both checks pass
 */
export async function authenticateUser(
	pat: string,
	org: string,
	requiredRoles: ('admin' | 'member')[] = ['member']
): Promise<{ success: boolean; user?: GitHubUser; role?: 'admin' | 'member'; error?: string }> {
	// Step 1: Validate PAT
	const patResult = await validatePAT(pat);
	if (!patResult.success || !patResult.user) {
		return {
			success: false,
			error: patResult.error || 'Failed to validate PAT'
		};
	}

	// Step 2: Verify role in organization
	const roleResult = await verifyUserRole(pat, org, patResult.user.login, requiredRoles);
	if (!roleResult.success) {
		return {
			success: false,
			error: roleResult.error || 'Failed to verify user role'
		};
	}

	if (!roleResult.hasAccess) {
		return {
			success: false,
			error: roleResult.error || 'User does not have the required role in the organization'
		};
	}

	// Both checks passed
	return {
		success: true,
		user: patResult.user,
		role: roleResult.membership?.role
	};
}
