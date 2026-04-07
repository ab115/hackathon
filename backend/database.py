from motor.motor_asyncio import AsyncIOMotorClient
import os

client: AsyncIOMotorClient = None

async def init_db():
    global client
    mongo_url = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    print("Connected to MongoDB via Motor")

async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")

def get_database():
    return client.hackathon
