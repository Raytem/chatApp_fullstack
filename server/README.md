
# **Realtime Chat App**
Server for [this](https://github.com/Raytem/NestJS_chatApp_client) client app

**Test users credo:**

1. email: newUser@yandex.by, password: 123
2. email: newUser_2@yandex.by, password: 123
3. email: test@yandex.by, password: 123

## Running the app
Go to the project directory and than write the following commands:

```bash
#give access to run the script
$ chmod +x ./fill-db.sh

#running the app
$ docker compose up -d
```

**Browser doesn't allow unsecure connection using HTTPS protocol,**
**so you must open the started app in browser by following link:**

https://localhost:80 (if you haven't changed the port)

and than allow unsecure connection
