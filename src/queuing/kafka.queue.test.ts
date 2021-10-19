import { KafkaQueue } from './kafka.queue';
import { RedisCache } from '../caching/redis.cache'
import * as sinon from 'sinon'
import { expect } from 'chai';
import { domain } from 'process';
describe('kafka queue test suit', () => {

    it('KAFKA_GROUP is mandatory parameter ', async () => {
        try {
            const mock = sinon.createStubInstance(RedisCache)
            const kafka = new KafkaQueue(mock)
            throw 'test failed';
        }
        catch (err) {
            expect(err).to.be('KAFKA_GROUP is mandatory parameter');
        }
    })

    it('should call consumer creation once', async () => {

        const env = process.env;
        process.env = { KAFKA_GROUP: 'GROUP_NAME' };
        try {
            const mock = sinon.createStubInstance(RedisCache)
            const kafka = new KafkaQueue(mock)

            const stubList = await sinon.stub(kafka.admin, "listTopics").returns(Promise.resolve(['wow']));
            const stubCreate = await sinon.stub(kafka.admin, "createTopics").returns(Promise.resolve(true));
            
            const results = await kafka.attach({
                domain: 'Hello',
                action: 'world'
            })

            expect(stubList.calledOnce)
            expect(stubCreate.calledOnce)
            expect(stubCreate.calledWith({ topics: [{ topic: 'HELLO_WORLD', numPartitions: 7, replicationFactor: 3 }] }))
            stubList.restore();
            stubCreate.restore();
        }
        catch (err) {
            console.error(err);
            process.env = env;
        }

    })


})