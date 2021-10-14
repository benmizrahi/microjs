import { EventBus } from '../../src/index'
import * as readline from 'readline'
import { promisify } from 'util'
(async () => {

    //init the event bus (connection to redis/kafka)
    await EventBus.init()

 
    //********************************************/
    ///client interface 
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question[promisify.custom] = (question) => {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    };

    const questions = async () => {
        //client interface example for operations 
        const operation: any = await promisify(rl.question)('Operation To do [ORDER,GET] ?');
        if (operation == 'ORDER') {
            const userId: any = await promisify(rl.question)('User Id ? ');
            const name: any = await promisify(rl.question)('Order name ? ');
            await EventBus.publishAsync('submitted', { userId, name, date: Date.now() }, 'orders')
        } else if (operation == 'GET') {
            const userId: any = await promisify(rl.question)('User Id ? ');
            const results = await EventBus.getAsync('orders', 'get', { filters: { userId } })
            console.log("*****************")
            console.log(`userId ${userId} have the following orders:`)
            results.map((item) => {
                console.log('**********')
                console.log(`${JSON.stringify(item)}`)
                console.log('**********')
            })
            console.log("*****************")
        }
        await questions();
    }
    await questions();
    //********************************************/

})().catch(console.error)