import { EventBus } from "./event.bus";
import { expect } from "chai";
import { after } from "mocha";

const EVENT_TO_LISTEN_TO = "PING";
describe.skip('Spec =>  testing event.bus functionality ', () => {

    before(async () => {
        const stringSchema = [`{
          "type": "record",
          "name": "PING",
          "namespace": "t1_local",
          "fields": [{ "type": "string", "name": "message" }]
        }`,
        `{
            "type": "record",
            "name": "PONG",
            "namespace": "t1_local",
            "fields": [{ "type": "string", "name": "message" }]
          }`]

        await EventBus.registerSchemas(null, stringSchema)
        await EventBus.generateServiceSchema(['t1_local.PONG','t1_local.PING'],__dirname)
    })

    after(async () => {
        await EventBus.shutDown();
    })
    it("should test reactiveAttach method gets activated on event passed", async () => {
        await EventBus.reactiveAttach({
            domain: 't1_local',
            action: EVENT_TO_LISTEN_TO, cb: (v) => {
                expect(v.message).to.be.equal('PONG') //check that PONG received 
            }
        });
        await EventBus.publishAsync('t1_local', EVENT_TO_LISTEN_TO, { message: 'PONG' }) //publish PING message 
    })

    it("should be register to event, publish and get results back", async () => {
        await EventBus.reactiveAttach({
            domain: 'service_a', //demonstrate service A listener 
            action: EVENT_TO_LISTEN_TO, cb: (v) => {
                expect(v.message).to.be.equal("PING")
                return { message: "PONG" }
            }
        });

        const results = await EventBus.getAsync('service_a', EVENT_TO_LISTEN_TO, { message: 'PING' }) //demonstrate service B calling service A
        expect(results.message).to.be.equal("PONG")
    })
});
