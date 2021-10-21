import { EventBus, ActionReact, IEventBusMessage } from '@microjs/packages'
(async () => {
    //init the event bus (connection to redis/kafka)
    await EventBus.init()
    class OrderService {

        private readonly inMemoryCache = {}

        /**
         * Totally async operation - when order submitted store the message in cache
         * @param message : { payload } : { userId, name, date }
         */
        @ActionReact({ action: 'submitted', domain: 'orders' })
        submitted = (message: IEventBusMessage) => {
            const { userId, name, date } = message.payload;
            console.log(`stated handling order ${name}`)
            if (!this.inMemoryCache[userId]) this.inMemoryCache[userId] = []
            this.inMemoryCache[userId].push({ name, date })
        }
        /**
         * Sync operation that returns the orders per filter
         * The message will produce a results to the queue and consume by the client
         * @param message : { payload }: { filters: { userId } }
         * returns Array<{ name, date}>
         */
        @ActionReact({ action: 'get', domain: 'orders' })
        get = (message: IEventBusMessage) => {
            const { filters }: { filters: { userId } } = message.payload;
            return this.inMemoryCache[filters.userId];
        }
    }

    new OrderService();

})().catch(console.error)




//EVENT_BUS_DRY
//REDIS_HOST
//REDIS_PORT
//RETRY_DLQ_COUNT
//KAFKA_SERVICE_NAME
//KAFKA_BROKER
//EVENT_BUS_CONNECTION_TIMEOUT
//EVENT_BUS_REQUEST_TIMEOUT
//EVENT_BUS_TIME
//EVENT_BUS_RETRY
//FROM_BEGINNING
//KAFKA_GROUP
//DEFAULT_NUMBER_OF_PARTITIONS
//SCHEMA_REGISTRY_URL


