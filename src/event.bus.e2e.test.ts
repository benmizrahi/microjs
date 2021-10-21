import { EventBus } from "./event.bus";
import { expect } from "chai";
import { after } from "mocha";

const EVENT_TO_LISTEN_TO = "PING";
describe.skip('Spec =>  testing event.bus functionality ', () => {

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
        await EventBus.publishAsync('t1_local', { payload: { message: 'PONG' } }, EVENT_TO_LISTEN_TO) //publish PING message 
    })

    it("should be register to event, publish and get results back", async () => {
        await EventBus.reactiveAttach({
            domain: 'service_a', //demonstrate service A listener 
            action: EVENT_TO_LISTEN_TO, cb: (v) => {
                expect(v.message).to.be.equal("PING")
                return { message: "PONG" }
            }
        });

        const results = await EventBus.getAsync('service_a', EVENT_TO_LISTEN_TO, { payload: { message: 'PING' } }) //demonstrate service B calling service A
        expect(results.message).to.be.equal("PONG")
    })
});
