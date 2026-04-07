import os
import json
import asyncio
from confluent_kafka import Consumer, KafkaError, KafkaException
from database import get_database, init_db, close_db

class RegistrationConsumer:
    def __init__(self):
        conf = {
            'bootstrap.servers': os.getenv('REDPANDA_BROKERS', 'localhost:9092'),
            'group.id': 'hackathon-registration-consumers',
            'auto.offset.reset': 'earliest'
        }
        self.consumer = Consumer(conf)
        self.running = False


    async def start(self):
        await init_db()
        db = get_database()
        
        self.consumer.subscribe(['registrations_topic'])
        self.running = True
        print("Consumer started, waiting for messages...")
        
        try:
            while self.running:
                # We use asyncio.sleep to not block the event loop entirely if running in same process, 
                # though usually consumers run in their own process.
                msg = self.consumer.poll(timeout=1.0)
                if msg is None:
                    await asyncio.sleep(0.1)
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(msg.error())
                        break

                try:
                    record = json.loads(msg.value().decode('utf-8'))
                    print(f"Consumed record: {record}")
                    
                    # Store in mongo
                    await db.registrations.insert_one(record)
                    print("Stored registration in MongoDB")
                    
                except json.JSONDecodeError as e:
                    print(f"Failed to decode message: {e}")
                except Exception as e:
                    print(f"Database error: {e}")
                    
        finally:
            self.consumer.close()
            await close_db()

    def stop(self):
        self.running = False

if __name__ == '__main__':
    consumer = RegistrationConsumer()
    try:
        asyncio.run(consumer.start())
    except KeyboardInterrupt:
        consumer.stop()
