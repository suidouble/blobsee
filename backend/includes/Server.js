const Fastify = require('fastify');

class Server {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this._port = params.server?.port || 8080;
        this._server = null;
	}

    log(str) {
        if (this._logger) {
            this._logger.debug(str);
        } else {
            console.log(str);
        }
    }

    async beforeInit(fastify) {
        this.log('beforeInit...');
    }

    async init(beforeInit) {
        this.log('Creating server instance...');
        this._server = Fastify();

        this.beforeInit(this._server);

        if (beforeInit) {
            await beforeInit(this);
        }

        await this._server.ready();
        await this._server.listen({ port: this._port, host: '0.0.0.0' });

        this.log('Server listening at port #'+this._port);
    }
}

module.exports = Server;