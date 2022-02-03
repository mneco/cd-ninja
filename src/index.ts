import { sanitize } from 'sanitize-filename-ts';
import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import { PORT, SCRIPTS_PATH } from './env';
import { inAuthorizedIp, getAliases, execScript } from './utils';

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

	const repo = sanitize(payload.repository.name);
	const branch = sanitize(payload.ref.split('/').pop());

	const aliases = getAliases();
	const names = [repo].concat(aliases.get(repo) ?? []);

	names.forEach(name => {
		const scriptPath = `${SCRIPTS_PATH}/${name}-${branch}.sh`;
		console.log(`Executing task at: ${scriptPath}`);
		execScript(scriptPath);
	});

	res.writeHead(200);
	res.end();
});

http.createServer(app).listen(PORT, () => {
	console.log(`CD Ninja server listening on port ${PORT}`);
});
