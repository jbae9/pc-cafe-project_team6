const { createClient } = require('redis')

class RedisService {
    constructor() {
        this.client = createClient({
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            },
            password: process.env.REDIS_PASSWORD
        })

        this.client.on('connect', () => console.log('Connected to Redis'))
        this.client.on('error', (err) => console.log('Redis client error', err))
        this.client.on('end', () => console.log('Disconnected from Redis'))
    }

    set = async ({ key, value, timeType, time }) => {
        try {
            await this.client.connect();
            await this.client.set(key, value, timeType, time);
            await this.client.disconnect();   
        } catch (error) {
            console.log(error)
        }
    }

    get = async (key) => {
        await this.client.connect();
        const result = await this.client.get(key);
        await this.client.disconnect();
        return result;
    }

    del = async (key) => {
        await this.client.connect()
        await this.client.del(key)
        await this.client.disconnect()
    }
}

module.exports = RedisService