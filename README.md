

# Realtime Chat App
This application is a highly simplified clone of Telegram messenger with its basic functionality.

**Tech stack:**
- Backend:
	- Node.js (Nest.js)
	- Postgres DB
	- Redis
	- Google Drive API
	- Socket.io (websockets)
- Frontend
	- React.js
	- Redux Toolkit
	- Socket.io (websockets)
- Deployment 
	- Docker
	- Docker compose

## Before project cloning (IMPORTANT!!!)
```bash
#block changing of end-line symbol
$ git config —global core.autocrlf false
```

## Running the app
Go to the project directory and than write the following commands:

```bash
#give access to run the script (for Mac & Linux)
$ chmod +x ./server/fill-db.sh

#running the app
$ docker compose up -d
```

> [!WARNING]
> Due to the self-signed SSL certificate, the browser swears that the connection is not secure, so follow the link ( https://localhost:80 ) and allow an unsecured connection

## Using the app
- Client –> http://localhost:5173 
- Server –> https://localhost:80
- Adminer for DB –> http://localhost:8080

## Test users credo
- email: newUser@yandex.by, password: 123
- email: newUser_2@yandex.by, password: 123
- email: test@yandex.by, password: 123
- email: test2@yandex.by, password: 123