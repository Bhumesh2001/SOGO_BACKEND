const redis = require('redis');

const client = redis.createClient({
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
});

client.connect()
    .then(() => {
        console.log('Connected to redis!');
    })
    .catch((err) => {
        console.error('Redis Connection Error', err);
    });

client.on('error', (err) => console.log('Redis Client Error', err));

module.exports = client;
