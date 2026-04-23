# Civil Design Web App
This app is used for RCC beam design, tank foundation design, and wind load calculation.
Tech stack:
- React
- Node.js
- Express
- PostgreSQL

## Prerequisites
1. Node.js v20.20.1 (or higher)
2. PostgreSQL v18 (or higher)

## Setup
1. Download project
2. Extract zip
3. Open terminal

## Install
cd server
npm install
cd client
npm install

## Run
Frontend:
--cd client
--npm run dev
Backend:
--cd server
--node index.js

## Database Setup
1. Install PostgreSQL
2. Create database:
CREATE DATABASE db_name;
3. Restore backup:
psql -U postgres -p 5433 -d db_name -f first_db_backup.sql

