const logger = require('./logger');

class StateManager {
    constructor() {
        this.userStates = new Map();
    }

    setState(userId, state) {
        this.userStates.set(userId, state);
        logger.info(`State set for user ${userId}: ${JSON.stringify(state)}`);
    }

    getState(userId) {
        return this.userStates.get(userId);
    }

    clearState(userId) {
        this.userStates.delete(userId);
        logger.info(`State cleared for user ${userId}`);
    }
}

module.exports = new StateManager(); 