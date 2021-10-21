# MicroJS
A microservices event bus for async/sync communication between NodeJs services - well tested in production grade handles millions of events per second  - in stream/batch mode.
##### dependencies: [KafkaJs](https://github.com/tulios/kafkajs/), [Redis](https://github.com/redis/node-redis/)

## How it works ?

Microjs uses **Redis** and **Kafka** as an infrastructure to pass messages and communicate between services, there are two directions that services can communicate - *one-way* OR *two-way* connection, let's explore both of them with examples. all communication directions are *async* non-blocking. The package allows you to take advantage of **domain-driven-design** while keeping the source code clean and simple. To see an actual working example please see the following README.md under the example folder.

## Getting Started

Install the package with you're favorite package manager:
```
npm install benmizrahi/microjs 
OR
yarn add benmizrahi/microjs
```

After having the package installed under you're project - you should define some environment variables to tell the events bus how to behave in this service - here is a list of environment variables need to be defined:

| variable| default | mandatory |  description |
|---------|-------|-----------| ------ |
| KAFKA_SERVICE_NAME | null | TRUE | the service name used in Kafka to create the consumer group and topics pattern
| KAFKA_GROUP | null | TRUE | the consumer group to use for this consuming messages from Kafka 
| KAFKA_BROKER | null | FALSE | Kafka brokers list 
| EVENT_BUS_CONNECTION_TIMEOUT| 30000 | FALSE | connectionTimeout (KafkaJs)
| EVENT_BUS_REQUEST_TIMEOUT| 30000 | FALSE | requestTimeout (KafkaJs)
| EVENT_BUS_TIME| 300 | FALSE | initialRetryTime (KafkaJs)
| EVENT_BUS_RETRY| 10 | FALSE | retries (KafkaJs)
| REDIS_HOST| localhost| TRUE | Redis communication host
| REDIS_PORT | 6379| TRUE| Redis communication port
| SCHEMA_REGISTRY_URL| null| FALSE | N/A
| RETRY_DLQ_COUNT | 3| FALSE | After the amount described here, the message/batch will pass to a dead letter queue for handling offline.

After having all mandatory environment variables defined - we can start using the package interface and communicate with the EventBus. To init the bus and start all communications via consumer/producers and Redis write the following action on you're index file to init the bus:
```
import { EventBus } from  '@microjs/packages'
await EventBus.init()
```

### EventBus Interfaces & Methods:

##### Global Helper methods:

`init: () => Promise<this>;` - The main methods the init the bus communication with the infrastructure, Kafka (consumers/producers) and Redis.  

`healthCheck: () => Promise<any>;` - Method that checks the health of communication with the infrastructure, the check will respond with  true/false if all infrastructure is alive and stable - this method is useful for health checks via Kubernetes or any other orchestration techniques 

`shutDown: () => Promise<void>;` - In case you need to graceful shutdown the service - use this methods the close all open connections and remove work in queuing.

---

##### Communication Methods:

`getAsync: (formDomain: any, action: string, obj: {}) => Promise<any>;` - An sync method that request the publishing an event to specific domain with specific action and resolved the promise when return value received. with this technic you can communicate between service to gather information and values from different services.

#### Example: 
`const OrderEntity = await EventBus.getAsync('Orders','GET',{ payload: { id: 1 } })` 
In this case we need to implement a reactive method that listens to GET events on Orders domain and return the values needed - the return value from the reactive method will be the result of the promise `OrderEntity` variable.

---

`publishAsync: (action: string, obj: { payload: any }, toDomain?: any) => Promise<boolean>;` - this method is used to publish events to specific domain and specific action, this is a **publish** action that returns true/false if message has been sent or not.  - please notifce 

#### Example:  

`await EventBus.publishAsync('OrderPlaced',{ payload: { message: 'HelloWorld' } }, 'Order')`

`bulkPublishAsync: (action: string, messages: { payload: any }[], formDomain?: any) => Promise<boolean>;` - Same as the above method but using a batch sending of messages - this way you can send batch of messages to specific domain on specific action.
#### Example:  

`await EventBus.publishAsync('OrderPlaced',[{ payload: { message: 'HelloWorld' } }], 'Order')`


