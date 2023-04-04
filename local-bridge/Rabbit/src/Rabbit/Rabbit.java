package Rabbit.src.Rabbit;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.bson.BsonDocument;
import org.bson.Document;


import com.rabbitmq.client.*;

import java.io.IOException;

public class Rabbit {
    private final static String QUEUE_NAME = "event_queue";

    public static void main(String[] argv) throws Exception {
        MongoClient mongoClient = MongoClients.create("mongodb://localhost:3001");
        MongoDatabase database = mongoClient.getDatabase("meteor");

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("16.170.107.18");
        factory.setPort(5672);
        factory.setUsername("rabbitmquser");
        factory.setPassword("rabbitmqpassword");

        Connection connection = factory.newConnection();
        Channel channel = connection.createChannel();

        channel.queueDeclare(QUEUE_NAME, false, false, false, null);
        System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

        Consumer consumer = new DefaultConsumer(channel) {
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope, AMQP.BasicProperties properties, byte[] body) throws IOException {
                String message = new String(body);
                BsonDocument bsonDocument = BsonDocument.parse(message);
                Document document = Document.parse(bsonDocument.toJson());
                database.getCollection("eiffel-events").insertOne(document);

                System.out.println(" [x] Received " + bsonDocument + "");
            }
        };
        channel.basicConsume(QUEUE_NAME, true, consumer);
    }
}
