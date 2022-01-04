import { sanitize } from 'string-sanitizer';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import express from 'express';
import { existsSync } from 'fs';
import http from 'http';
import { PORT, SCRIPT_PATH } from './env';
import { inAuthorizedIp } from './utils';

function execScript(scriptPath: string) {
	if (!existsSync(scriptPath)) {
		return;
	}

	exec(scriptPath, { env: process.env }, error => {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}

const app = express();
app.set('port', PORT);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', (req, res) => {
	let payload;
	try {
		payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
		if (!payload) {
			throw new Error('No payload');
		}
	} catch (e) {
		console.log(`No payload: ${e}`, req.body);
		res.writeHead(400);
		res.end();
		return;
	}

	const ipv4 = req.ip.replace('::ffff:', '');
	if (!inAuthorizedIp(ipv4)) {
		console.log('Unauthorized IP:', req.ip, '(', ipv4, ')');
		res.writeHead(403);
		res.end();
		return;
	}

	if (!payload.ref) {
		res.writeHead(200);
		res.end();
		return;
	}

	const repo = sanitize.addDash(payload.repository.name);
	const branch = sanitize.addDash(payload.ref.split('/').pop());

	const scriptPath = `${SCRIPT_PATH}/${repo}-${branch}.sh`;
	console.log(`Executing task at: ${scriptPath}`);
	execScript(scriptPath);

	res.writeHead(200);
	res.end();
});

http.createServer(app).listen(PORT, () => {
	console.log(`CD Ninja server listening on port ${PORT}`);
});
