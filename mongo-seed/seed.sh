#!/bin/bash
echo "Waiting for MongoDB to start..."
sleep 10  # Ensure MongoDB is up

echo "Seeding MongoDB..."
mongoimport --host mongodb --db $MONGO_DB_NAME --collection $MONGO_COLLECTION --drop --file /data.json --jsonArray

echo "MongoDB seeding completed."
