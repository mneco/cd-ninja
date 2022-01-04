import { AUTHORIZED_IP, GITHUB_SUBNET, GITHUB_IP } from './env';

export function inAuthorizedSubnet(ip: string): boolean {
	return GITHUB_SUBNET.some(subnet => subnet.contains(ip));
}

export function inAuthorizedIp(ip: string): boolean {
	return inAuthorizedSubnet(ip) || AUTHORIZED_IP.indexOf(ip) > -1 || GITHUB_IP.indexOf(ip) > -1;
}
