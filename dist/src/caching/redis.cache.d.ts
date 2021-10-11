import { ICaching } from './caching.factory';
export declare class RedisCache implements ICaching {
    private readonly pub_redis;
    private readonly sub_redis;
    init: () => Promise<void>;
    messages_callbacks: {};
    set: (key: any, value: any) => Promise<string | null>;
    publish: (key: any, value: any) => Promise<number>;
    get: (key: any) => Promise<string | null>;
    delete: (key: any) => Promise<number>;
    registerOnChange: (key: any, cb_handler: any) => Promise<boolean>;
    shutdown(): Promise<void>;
    isHealth: () => Promise<boolean>;
}
