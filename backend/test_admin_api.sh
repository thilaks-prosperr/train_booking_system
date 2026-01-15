#!/bin/bash

# 1. Login to get token
echo "Logging in as admin..."
LOGIN_RES=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"admin"}')

TOKEN=$(echo $LOGIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Login failed. Response: $LOGIN_RES"
    exit 1
fi

echo "Got Token: ${TOKEN:0:10}..."

# 2. Test GET Trains
echo "----------------------------------------"
echo "Testing GET /api/admin/trains..."
curl -v http://localhost:8080/api/admin/trains \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n----------------------------------------"

# 2.5. Test GET Trains (No Token - Check permitAll)
echo "Testing GET /api/admin/trains (No Token)..."
curl -v http://localhost:8080/api/admin/trains

echo -e "\n----------------------------------------"

# 3. Test POST Train
echo "Testing POST /api/admin/trains..."
curl -v -X POST http://localhost:8080/api/admin/trains \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "trainNumber": "TEST-999",
    "trainName": "Debug Express",
    "totalSeatsPerCoach": 60,
    "numberOfCoaches": 10,
    "price": 150
  }'

echo -e "\n----------------------------------------"
