import { IBusReactiveParams } from './models/IBusReactiveParams';
declare class EventBusHandler {
    dryRun: boolean;
    private caching;
    private queue;
    constructor();
    init: () => Promise<this>;
    registerSchemas: (filePath: any, stringSchemas?: string[] | undefined) => Promise<void>;
    generateServiceSchema: (services: any, path: any) => Promise<void>;
    reactiveAttach: (params: IBusReactiveParams) => Promise<void>;
    publishAsync: (action: string, obj: {}, toService?: any) => Promise<boolean>;
    bulkPublishAsync: (action: string, messages: {}[], toService?: any) => Promise<boolean>;
    getAsync: (formService: any, action: string, obj: {}) => Promise<any>;
    shutDown: () => Promise<void>;
    private uuidv4;
    healthCheck: () => Promise<any>;
}
export declare const EventBus: EventBusHandler;
export {};
