"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const tslib_1 = require("tslib");
const caching_factory_1 = require("./caching/caching.factory");
const queuing_factory_1 = require("./queuing/queuing.factory");
const fs = require("fs");
const util_1 = require("util");
class EventBusHandler {
    constructor() {
        this.dryRun = false;
        this.init = () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            yield this.caching.init();
            return this;
        });
        this.registerSchemas = (filePath, stringSchemas) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (filePath) {
                const readFile = (0, util_1.promisify)(fs.readFile);
                const file = yield readFile(filePath);
                stringSchemas = JSON.parse(file.toString()).map((item) => JSON.stringify(item));
            }
            //@ts-ignore
            yield this.queue.registerSchema(stringSchemas);
        });
        this.generateServiceSchema = (services, path) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const result = yield this.queue.generateSchemas(services);
            const writeFile = (0, util_1.promisify)(fs.writeFile);
            yield writeFile('external.services.json', JSON.stringify(result));
        });
        this.reactiveAttach = (params) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.dryRun)
                return;
            yield this.queue.attach(params);
        });
        this.publishAsync = (action, obj, toService) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.dryRun)
                return true;
            return yield this.queue.publish(action, this.uuidv4(), obj, toService);
        });
        this.bulkPublishAsync = (action, messages, toService) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.dryRun)
                return true;
            const formattedMessages = messages.map((message) => {
                return {
                    key: this.uuidv4(),
                    value: Buffer.from(JSON.stringify(message))
                };
            });
            return yield this.queue.bulkPublish(action, formattedMessages, toService);
        });
        this.getAsync = (formService, action, obj) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.dryRun)
                return;
            return new Promise((resolve, reject) => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
                const key = this.uuidv4(); //message key;
                yield this.caching.set(`service:${process.env.KAFKA_SERVICE_NAME}:key:${key}`, "-1"); //set empty value and wait for response;
                this.caching.registerOnChange(`service:${process.env.KAFKA_SERVICE_NAME}:key:${key}`, (value) => {
                    resolve(value);
                });
                yield this.queue.publish(action, `service:${process.env.KAFKA_SERVICE_NAME}:key:${key}`, obj, formService); //publish message to the queue
            }));
        });
        this.shutDown = () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            if (this.dryRun)
                return;
            yield this.queue.shutdown();
            yield this.caching.shutdown();
        });
        this.uuidv4 = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        this.healthCheck = () => (0, tslib_1.__awaiter)(this, void 0, void 0, function* () {
            const isQueueHealth = yield this.queue.isHealth();
            const isCachingHealth = yield this.caching.isHealth();
            return isQueueHealth && isCachingHealth;
        });
        this.dryRun = process.env.EVENT_BUS_DRY == "1" ? true : false;
        if (!this.dryRun) {
            this.caching = (0, caching_factory_1.caching)("redis");
            this.queue = (0, queuing_factory_1.queuing)("kafka", this.caching);
        }
    }
}
exports.EventBus = new EventBusHandler();
//# sourceMappingURL=event.bus.js.map