import { exec } from 'child_process';
import { existsSync } from 'fs';
import { readFileSync } from 'fs';
import { AUTHORIZED_IP, GITHUB_SUBNET, GITHUB_IP } from './env';

export function inAuthorizedSubnet(ip: string): boolean {
	return GITHUB_SUBNET.some(subnet => subnet.contains(ip));
}

export function inAuthorizedIp(ip: string): boolean {
	return inAuthorizedSubnet(ip) || AUTHORIZED_IP.indexOf(ip) > -1 || GITHUB_IP.indexOf(ip) > -1;
}

export function getAliases(): Map<string, string[]> {
	const file: string = readFileSync('.alias', 'utf8');
	const mapping = new Map();
	file.split('\n').forEach(line => {
		const [alias, repo] = line.split(',').map(s => s.trim());
		if (!mapping.has(repo)) {
			mapping.set(repo, []);
		}
		mapping.get(repo).push(alias);
	});
	return mapping;
}

export function execScript(scriptPath: string) {
	if (!existsSync(scriptPath)) {
		return;
	}

	exec(scriptPath, { env: process.env }, error => {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}
