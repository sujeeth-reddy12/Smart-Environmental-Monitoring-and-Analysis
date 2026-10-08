from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "environment_monitoring")

USERS_COLLECTION = "users"
PREDICTIONS_COLLECTION = "predictions"
ENVIRONMENTAL_DATA_COLLECTION = "environmental_data"
SESSIONS_COLLECTION = "sessions"
LOCATIONS_COLLECTION = "locations"
MODEL_METRICS_COLLECTION = "model_metrics"

client = None
database = None


async def connect_to_mongodb():
    global client, database

    client = AsyncIOMotorClient(MONGODB_URI)

    # Actually test the connection
    await client.admin.command("ping")

    database = client[DATABASE_NAME]

    await database[USERS_COLLECTION].create_index("email", unique=True)
    await database[SESSIONS_COLLECTION].create_index("token_hash", unique=True)
    await database[SESSIONS_COLLECTION].create_index("expires_at", expireAfterSeconds=0)
    await database[PREDICTIONS_COLLECTION].create_index([("user_id", 1), ("timestamp", -1)])
    await database[ENVIRONMENTAL_DATA_COLLECTION].create_index([("location", 1), ("timestamp", -1)])
    await database[LOCATIONS_COLLECTION].create_index("name")

    print("Connected to MongoDB Atlas")

async def close_mongodb_connection():
    global client

    if client:
        client.close()
        print("MongoDB Connection Closed")


def get_database():
    return database