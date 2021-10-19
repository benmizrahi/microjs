"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const kafka_queue_1 = require("./kafka.queue");
const redis_cache_1 = require("../caching/redis.cache");
const sinon = require("sinon");
const chai_1 = require("chai");
describe('kafka queue test suit', () => {
    it('KAFKA_GROUP is mandatory parameter ', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        try {
            const mock = sinon.createStubInstance(redis_cache_1.RedisCache);
            const kafka = new kafka_queue_1.KafkaQueue(mock);
            throw 'test failed';
        }
        catch (err) {
            (0, chai_1.expect)(err).to.be('KAFKA_GROUP is mandatory parameter');
        }
    }));
    it('should call consumer creation once', () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        const env = process.env;
        process.env = { KAFKA_GROUP: 'GROUP_NAME' };
        try {
            const mock = sinon.createStubInstance(redis_cache_1.RedisCache);
            const kafka = new kafka_queue_1.KafkaQueue(mock);
            const stubList = yield sinon.stub(kafka.admin, "listTopics").returns(Promise.resolve(['wow']));
            const stubCreate = yield sinon.stub(kafka.admin, "createTopics").returns(Promise.resolve(true));
            const results = yield kafka.attach({
                domain: 'Hello',
                action: 'world'
            });
            (0, chai_1.expect)(stubList.calledOnce);
            (0, chai_1.expect)(stubCreate.calledOnce);
            (0, chai_1.expect)(stubCreate.calledWith({ topics: [{ topic: 'HELLO_WORLD', numPartitions: 7, replicationFactor: 3 }] }));
            stubList.restore();
            stubCreate.restore();
        }
        catch (err) {
            console.error(err);
            process.env = env;
        }
    }));
});
//# sourceMappingURL=kafka.queue.test.js.map