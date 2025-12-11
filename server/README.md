# EventHall Backend

Backend API server for EventHall using Node.js, Express, and MySQL.

## Setup

1. Install XAMPP and start MySQL
2. Create database: `mysql -u root < database/schema.sql`
3. Install dependencies: `npm install`
4. Create `.env` file:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=eventhall
PORT=3001
```

5. Start server: `npm run dev`

## Database Connection

The server connects to MySQL on `localhost:3306` with the database name `eventhall`.

Make sure XAMPP is running with MySQL service started before running the backend.
