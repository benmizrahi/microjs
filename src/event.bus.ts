import { caching, ICaching } from './caching/caching.factory';
import { IBusReactiveParams } from './models/IBusReactiveParams';
import { IQueue, queuing } from './queuing/queuing.factory';
import * as fs from 'fs'
import { promisify } from 'util';

class EventBusHandler {
  dryRun: boolean = false;
  //@ts-ignore
  private caching: ICaching;
  //@ts-ignore
  private queue: IQueue;

  constructor() {
    this.dryRun = process.env.EVENT_BUS_DRY == "1" ? true : false
    if (!this.dryRun) {
      this.caching = caching("redis")
      this.queue = queuing("kafka", this.caching);
    }
  }

  init = async () => {
    await this.caching.init();
    return this;
  }

  private registerSchemas = async (filePath, stringSchemas?: string[]) => {
    if (filePath) {
      const readFile = promisify(fs.readFile);
      const file = await readFile(filePath)
      stringSchemas = JSON.parse(file.toString()).map((item) => JSON.stringify(item));
    }
    //@ts-ignore
    await this.queue.registerSchema(stringSchemas);
  }

  private  generateServiceSchema = async (services, path) => {
    const result = await this.queue.generateSchemas(services);
    const writeFile = promisify(fs.writeFile);
    await writeFile('external.services.json', JSON.stringify(result))
  }

  reactiveAttach = async (params: IBusReactiveParams) => {
    if (this.dryRun) return
    await this.queue.attach(params)
  }

  publishAsync = async (action: string, obj: { payload: any }, toDomain?): Promise<boolean> => {
    if (this.dryRun) return true
    return await this.queue.publish(action, this.uuidv4(), obj, toDomain)
  }

  bulkPublishAsync = async (action: string, messages: { payload: any }[], toDomain?): Promise<boolean> => {
    if (this.dryRun) return true
    const formattedMessages = messages.map((message) => {
      return {
        key: this.uuidv4(),
        value: Buffer.from(JSON.stringify(message))
      }
    })
    return await this.queue.bulkPublish(action, formattedMessages, toDomain)
  }

  getAsync = async (formDomain, action: string, obj: { payload: any }): Promise<any> => {
    if (this.dryRun) return
    return new Promise(async (resolve, reject) => {
      const key = this.uuidv4(); //message key;
      await this.caching.set(`service:${process.env.KAFKA_SERVICE_NAME}:key:${key}`, "-1") //set empty value and wait for response;
      this.caching.registerOnChange(`service:${process.env.KAFKA_SERVICE_NAME}:key:${key}`, (value) => { //mark to be deleted!
        resolve(value);
      })
      await this.queue.publish(action, `service:${process.env.KAFKA_SERVICE_NAME}:key:${key}`, obj, formDomain); //publish message to the queue
    })
  }

  shutDown = async () => {
    if (this.dryRun) return
    await this.queue.shutdown();
    await this.caching.shutdown();
  }

  private uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  healthCheck = async () => {
     const isQueueHealth =  await this.queue.isHealth()
     const isCachingHealth =  await this.caching.isHealth()
     return isQueueHealth && isCachingHealth;
  }
}

export const EventBus = new EventBusHandler()
