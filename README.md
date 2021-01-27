# iti-community-server

## Installation

1. Download and run [ArangoDB](https://www.arangodb.com/download-major) database. Do not set any passwords for the database.

2. run `npm install`


## Execution

Run `npm start` to start the server

You can use the debugger as well.

## Configuration

You can use a configuration file named `.env` to overwrite any default configuration values of `src/server/config/env.ts`

Suppose you want to overwrite PORT and LOCAL_FILES_URL the file content should be 

```
PORT=8080
LOCAL_FILES_URL=http://localhost:8080/file
```

