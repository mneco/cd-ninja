import { config } from 'dotenv';
import { Netmask } from 'netmask';

config();

export const PORT = Number(process.env.PORT ?? 61439);

export const AUTHORIZED_IP: string[] = (process.env.AUTHORIZED_IP ?? '127.0.0.1, localhost')
	.split(',')
	.map(s => s.trim());

export const GITHUB_SUBNET: Netmask[] = (
	process.env.GITHUB_SUBNET ?? '192.30.252.0/22, 185.199.108.0/22, 140.82.112.0/20, 143.55.64.0/20'
)
	.split(',')
	.map(s => new Netmask(s.trim()));

export const GITHUB_IP: string[] = (
	process.env.GITHUB_IP ?? '207.97.227.253, 50.57.128.197, 204.232.175.75, 108.171.174.178'
)
	.split(',')
	.map(s => s.trim());

export const SCRIPTS_PATH: string = process.env.SCRIPTS_PATH ?? './scripts';
