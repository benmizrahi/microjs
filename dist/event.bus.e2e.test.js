"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_bus_1 = require("./event.bus");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const EVENT_TO_LISTEN_TO = "PING";
describe.skip('Spec =>  testing event.bus functionality ', () => {
    before(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
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
          }`];
        yield event_bus_1.EventBus.registerSchemas(null, stringSchema);
        yield event_bus_1.EventBus.generateServiceSchema(['t1_local.PONG', 't1_local.PING'], __dirname);
    }));
    (0, mocha_1.after)(() => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield event_bus_1.EventBus.shutDown();
    }));
    it("should test reactiveAttach method gets activated on event passed", () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield event_bus_1.EventBus.reactiveAttach({
            domain: 't1_local',
            action: EVENT_TO_LISTEN_TO, cb: (v) => {
                (0, chai_1.expect)(v.message).to.be.equal('PONG'); //check that PONG received 
            }
        });
        yield event_bus_1.EventBus.publishAsync('t1_local', EVENT_TO_LISTEN_TO, { message: 'PONG' }); //publish PING message 
    }));
    it("should be register to event, publish and get results back", () => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
        yield event_bus_1.EventBus.reactiveAttach({
            domain: 'service_a',
            action: EVENT_TO_LISTEN_TO, cb: (v) => {
                (0, chai_1.expect)(v.message).to.be.equal("PING");
                return { message: "PONG" };
            }
        });
        const results = yield event_bus_1.EventBus.getAsync('service_a', EVENT_TO_LISTEN_TO, { message: 'PING' }); //demonstrate service B calling service A
        (0, chai_1.expect)(results.message).to.be.equal("PONG");
    }));
});
//# sourceMappingURL=event.bus.e2e.test.js.map