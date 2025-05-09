# Unipath
Unipath - a web application that display High School National Exam points, predicts university entrance points, and suggest study strategy for students

# Setup for development
## Frontend Setup
Install frontend dependencies
```
cd frontend
npm i
```
Run
```
npm run dev
```


## Backend Setup
Install backend dependencies
```
cd backend
npm i
```
Start server
```
// backend/
node index.js
```
## Run with Docker (Includes Auto CSV Import)
From the root directory, run:
```
cd backend
docker-compose up -d
```
This will start:

mysql: MySQL database container (port 3307)

load_data: a one-time script to import all CSV files in backend/csv-file/ into the majors table

backend-unipath: backend server on port 8080
## CSV Directory Structure
Place your CSV files in:
backend/
└── csv-file/
    ├── test.csv
    └── another-file.csv
## Cleanup
To stop and remove all containers and volumes
```
docker-compose down -v
```
## Check log loadData
```
docker logs -f load-data
```


