from confluent_kafka import Producer
import os
import json

class RedpandaProducer:
    def __init__(self):
        conf = {
            'bootstrap.servers': os.getenv('REDPANDA_BROKERS', 'localhost:9092'),
            'client.id': 'hackathon-registration-producer'
        }
        try:
            self.producer = Producer(conf)
            print("Connected to Redpanda Producer")
        except Exception as e:
            print(f"Failed to connect to Redpanda: {e}")
            self.producer = None

    def delivery_report(self, err, msg):
        if err is not None:
            print(f'Message delivery failed: {err}')
        else:
            print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

    def publish_registration(self, registration_data: dict):
        if not self.producer:
            print("Producer not initialized, dropping message.")
            return

        topic = 'registrations_topic'
        try:
            self.producer.produce(
                topic,
                key=registration_data.get('email', str(id(registration_data))),
                value=json.dumps(registration_data),
                callback=self.delivery_report
            )
            self.producer.poll(0)
        except BufferError:
            print(f'Local producer queue is full (registrations_topic)')

producer = RedpandaProducer()
