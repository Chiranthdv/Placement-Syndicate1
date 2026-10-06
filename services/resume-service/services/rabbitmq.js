const amqp = require("amqplib");

const QUEUE_NAME = "resume_processing";

async function publishResumeJob(message) {
    const connection = await amqp.connect(
        process.env.RABBITMQ_URL
    );

    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, {
        durable: true
    });

    channel.sendToQueue(
        QUEUE_NAME,
        Buffer.from(JSON.stringify(message)),
        {
            persistent: true
        }
    );

    console.log("Resume job sent to RabbitMQ");

    await channel.close();
    await connection.close();
}

module.exports = {
    publishResumeJob,
    QUEUE_NAME
};