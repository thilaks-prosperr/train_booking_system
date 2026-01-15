#!/bin/bash

# Base URL
API_URL="http://localhost:8080/api"

# 1. Login to get Token
echo "Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin", "password":"password"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  # Fallback: maybe password is 'admin' (DataSeeder had 'admin' encoded)
  # Actually DataSeeder seeded 'admin'/'admin' in previous turn? 
  # Wait, DataSeeder.seedUsers(): new User(..., "admin", encode("admin"), ...)
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin", "password":"admin"}')
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"jwt":"[^"]*' | cut -d'"' -f4)
fi

if [ -z "$TOKEN" ]; then
    echo "Login failed. Please check credentials."
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "Token received."
AUTH_HEADER="Authorization: Bearer $TOKEN"

# Function to create station
create_station() {
    NAME=$1
    CODE=$2
    CITY=$3
    LAT=$4
    LNG=$5
    echo "Creating Station $NAME..."
    curl -s -X POST "$API_URL/admin/stations" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{\"stationName\": \"$NAME\", \"stationCode\": \"$CODE\", \"city\": \"$CITY\", \"latitude\": $LAT, \"longitude\": $LNG}"
}

# Function to create train
create_train() {
    NAME=$1
    NUMBER=$2
    echo "Creating Train $NAME..."
    # Response contains the TRAIN OBJECT. We need to extract ID.
    # Using python/node for JSON parsing if available, or grep trick.
    RESPONSE=$(curl -s -X POST "$API_URL/admin/trains" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{\"trainName\": \"$NAME\", \"trainNumber\": \"$NUMBER\", \"totalSeatsPerCoach\": 60}")
    
    # Extract ID (simple regex for "trainId":123)
    # Using python for reliability if installed
    TRAIN_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['trainId'])")
    echo $TRAIN_ID
}

# Function to add schedule
add_schedule() {
    TRAIN_ID=$1
    STATION_ID=$2
    SEQ=$3
    ARR=$4
    DEP=$5
    DIST=$6
    echo "Adding Schedule for Train $TRAIN_ID at Station $STATION_ID..."
    curl -s -X POST "$API_URL/admin/trains/$TRAIN_ID/schedule" \
        -H "Content-Type: application/json" \
        -H "$AUTH_HEADER" \
        -d "{\"stationId\": $STATION_ID, \"stopSequence\": $SEQ, \"arrivalTime\": \"$ARR\", \"departureTime\": \"$DEP\", \"distanceFromStartKm\": $DIST}" > /dev/null
}

# 2. Create Stations
# Need to get Station IDs back. 
# Let's create and then fetch all to map Codes to IDs.
create_station "Station A" "STA" "City A" 10.0 10.0 > /dev/null
create_station "Station B" "STB" "City B" 11.0 11.0 > /dev/null
create_station "Station C" "STC" "City C" 12.0 12.0 > /dev/null
create_station "Station D" "STD" "City D" 13.0 13.0 > /dev/null

echo "Stations created. Fetching IDs..."
STATIONS_JSON=$(curl -s -H "$AUTH_HEADER" "$API_URL/stations")

# Extract IDs using python
ID_A=$(echo $STATIONS_JSON | python3 -c "import sys, json; print(next(s['stationId'] for s in json.load(sys.stdin) if s['stationCode']=='STA'))")
ID_B=$(echo $STATIONS_JSON | python3 -c "import sys, json; print(next(s['stationId'] for s in json.load(sys.stdin) if s['stationCode']=='STB'))")
ID_C=$(echo $STATIONS_JSON | python3 -c "import sys, json; print(next(s['stationId'] for s in json.load(sys.stdin) if s['stationCode']=='STC'))")
ID_D=$(echo $STATIONS_JSON | python3 -c "import sys, json; print(next(s['stationId'] for s in json.load(sys.stdin) if s['stationCode']=='STD'))")

echo "IDs: A=$ID_A, B=$ID_B, C=$ID_C, D=$ID_D"

# 3. Create Trains & Schedules

# Train 1: A -> B
# Dep A 08:00, Arr B 10:00
T1_ID=$(create_train "Link A-B" "90001")
echo "Created Train 1 ID: $T1_ID"
add_schedule $T1_ID $ID_A 1 "08:00" "08:00" 0
add_schedule $T1_ID $ID_B 2 "10:00" "10:00" 100

# Train 2: B -> C
# Dep B 12:00, Arr C 14:00 (2h layover at B)
T2_ID=$(create_train "Link B-C" "90002")
echo "Created Train 2 ID: $T2_ID"
add_schedule $T2_ID $ID_B 1 "12:00" "12:00" 0
add_schedule $T2_ID $ID_C 2 "14:00" "14:00" 100

# Train 3: C -> D
# Dep C 16:00, Arr D 18:00 (2h layover at C)
T3_ID=$(create_train "Link C-D" "90003")
echo "Created Train 3 ID: $T3_ID"
add_schedule $T3_ID $ID_C 1 "16:00" "16:00" 0
add_schedule $T3_ID $ID_D 2 "18:00" "18:00" 100

# Train 4: D -> A
# Dep D 20:00, Arr A 22:00 (2h layover at D)
T4_ID=$(create_train "Link D-A" "90004")
echo "Created Train 4 ID: $T4_ID"
add_schedule $T4_ID $ID_D 1 "20:00" "20:00" 0
add_schedule $T4_ID $ID_A 2 "22:00" "22:00" 100

echo "✅ Test Data Seeded Successfully!"
