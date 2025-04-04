const AuthService = require('../services/auth.service');
const UserService = require('../services/user.service');
const SensorService = require('../services/sensor.service');

class ServiceContainer {
    constructor() {
        this.services = {
            auth: AuthService,
            user: UserService,
            sensor: SensorService
        };
    }

    get(serviceName) {
        const service = this.services[serviceName];
        if (!service) {
            throw new Error(`Service ${serviceName} not found`);
        }
        return service;
    }
}

module.exports = new ServiceContainer();
