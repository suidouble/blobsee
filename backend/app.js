const settings = require('./settings/settings.js');
const Server = require('./includes/Server.js');

const extraRoutes = require('./routes');

const run = async()=>{
	const server = new Server(settings);

	// add and initialize extra routes
	const extraRoutesHandlers = await extraRoutes.loadRoutes();
	const handlers = [];
	for (let Handler of extraRoutesHandlers) {
		const handler = new Handler({
			fastify: server,
			db: settings.db,
			settings: settings,
		});
		handlers.push(handler);
	}

	const beforeInit = async()=>{
		for (let handler of handlers) {
			await handler.init();
		}
	};

	await server.init(beforeInit);
};

run();