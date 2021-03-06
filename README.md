# Чат (WebSocket + Express)

- [Подключение](#connect)
- [Действия](#do)
  - [Авторизация и получение списка диалогов](#do0)
  - [Новый диалог](#do1)
  - [Отправка сообщения](#do2)
  - [Удаление сообщения](#do3)
  - [Получить историю чата](#do4)
  - [Отметить чат прочитанным](#do5)
  - [Очистить историю чата](#do6)
  - [Удалить чат](#do7)
  - [Начать звонок (RTC)](#do8)
  - [Ответить на звонок (RTC)](#do9)
  - [Передать Ice Candidate (RTC)](#do10)
- [События](#events)
- [Типы данных](#types)
- [Файлы](#files)

<a name="connect"></a>
## Подключение
```typescript
let socket = io('ws://localhost:3000', {
    path : '/',
    transports : ['websocket']
});
```

<a name="do"></a>
## Действия
<a name="do0"></a>
### Авторизация и получение списка диалогов
В ответ у вас будет вызвано событие ```on.user.authorized```
```typescript
socket.emit('user.auth', {
    id : Number,
    token : String
})
```
<a name="do1"></a>
### Новый диалог

В ответ у обеих сторон будет вызвано событие ```on.message.new```
```typescript
socket.emit('chat.start', {
    user_id : Number,
    text : String,
    attachment_id? : Number
})
```
<a name="do2"></a>
### Отправка сообщения

В ответ у обеих сторон будет вызвано событие ```on.message.new```
```typescript
socket.emit('message.send', {
    room_id : Number,
    text : String,
    attachment_id? : Number
})
```
<a name="do3"></a>
### Удаление сообщения

В ответ у обеих сторон будет вызвано событие ```on.message.delete```
```typescript
socket.emit('message.delete', {
    message_id : Number
})
```
<a name="do4"></a>
### Получить историю чата

В ответ у вас будет вызвано событие ```on.chat.history```
```typescript
socket.emit('chat.history', {
    room_id : Number,
    limit? : Number,
    last_id? : Number
})
```
<a name="do5"></a>
### Отметить чат прочитанным

В ответ у вас будет вызвано событие ```on.chat.read```
```typescript
socket.emit('chat.read', {
    room_id : Number
})
```
<a name="do6"></a>
### Очистить историю чата

В ответ у вас будет вызвано событие ```on.chat.clear```
```typescript
socket.emit('chat.clear', {
    room_id : Number
})
```
<a name="do7"></a>
### Удалить чат

В ответ у обеих сторон будет вызвано событие ```on.chat.delete```
```typescript
socket.emit('chat.delete', {
    room_id : Number
})
```
<a name="do8"></a>
### Начать звонок (RTC)

В ответ у собеседника будет вызвано событие ```on.call.start```
```typescript
socket.emit('call.start', {
    user_id : Number,
    session_description : RTCSessionDescription
})
```
<a name="do9"></a>
### Ответить на звонок (RTC)

В ответ у собседеника будет вызвано событие ```on.call.answer```
```typescript
socket.emit('call.answer', {
    call_id : Number,
    session_description : RTCSessionDescription
})
```

<a name="do10"></a>
### Передать Ice Candidate (RTC)

В ответ у собседеника будет вызвано событие ```on.call.ice```
```typescript
socket.emit('call.ice', {
    call_id : Number,
    ice_candidate : RTCIceCandidate
})
```

<a name="events"></a>
## События

### Авторизация
Вызывается в ответ на ```user.auth```
```typescript
socket.on('on.user.authorized', ({
    success : Boolean,
    dialogs : [
        { 
            chat : Chat, 
            room : Room,
            message : Message | null    
        }
    ],
    user : User | null
}) => {})
```
### Новое сообщение
Вызывается у обеих сторон при  ```message.send```, ```chat.start```
```typescript
socket.on('on.message.new', ({
    chat : Chat,
    room : Room,
    message : Message
}) => {})
```
### Сообщение удалено
Вызывается у обеих сторон при  ```message.delete```
```typescript
socket.on('on.message.delete', ({
    chat : Chat,
    room : Room,
    message : Message
}) => {})
```

### Чат удален
Вызывается у обеих сторон при  ```chat.delete```
```typescript
socket.on('on.chat.delete', ({
    chat : Chat,
    room : Room
}) => {})
```

### Чат очищен
Вызывается у обеих сторон при  ```chat.clear```
```typescript
socket.on('on.chat.clear', ({
    chat : Chat,
    room : Room
}) => {})
```

### Чат прочитан
Вызывается в ответ на  ```chat.reed```
```typescript
socket.on('on.chat.read', ({
    chat : Chat,
    room : Room
}) => {})
```

### Входящий звонок (RTC)
Вызывается при входящем звонке, когда собеседник использовал ```call.start```
```typescript
socket.on('on.call.start', ({
    user : User,
    call : Call,    
    session_description : Object
}) => {})
```

### Вызов принят (RTC)
Вызывается при ответе на ваш звонок, когда собеседник использовал ```call.answer```
```typescript
socket.on('on.call.answer', ({
    user : User,
    call : Call,    
    session_description : Object
}) => {})
```

### Передача ICE Candidate (RTC)
Вызывается при новом ice_candidate, когда собеседник использовал ```call.ice```
```typescript
socket.on('on.call.ice', ({
    call : Call,    
    ice_candidate : Object
}) => {})
```

### Онлайн/оффлайн
Вызывается у всех при новом подключении юзера к соккету
```typescript
socket.on('on.user.online', ({
    id : Number,
    online : Boolean
}) => {})
```

### История чата загружена
Вызывается в ответ на ```chat.history```
```typescript
socket.on('on.chat.history', ({
    messages : Message[],
    chat : Chat,
    room : Room
}) => {})
```
<a name="types"></a>
## Типы данных

### Chat
```typescript
interface Chat{
    user_id : Number,
    unread_count : Number,
    created_at : Date,
    updated_at : Date
}
```

### Room
```typescript
interface Room{
    id : Number,
    users : User[],
    created_at : Date
}
```

### Message
```typescript
interface Message{
    id: Number,
    room_id : Number,
    user_id : Number,
    created_at : Date,
    updated_at : Date,
    text : String,
    attachment : Attachment | null 
}
```

### Attachment
```typescript
interface Attachment{
    id : Number,
    type : String,
    file_id : Number,
    room_id : Number,
    created_at : Date
}
```

### User
```typescript
interface User{
    id : Number,
    created_at : Date
}
```

### File
```typescript
interface File{
    id : Number,
    user_id : Number,
    created_at : Date
}
```


### Call
```typescript
interface Call{
    id : Number,
    receiver_id : Number,
    caller_id : Number,
    created_at : Date,
    status : String
}
```

<a name="files"></a>
## Файлы

### Загрузка файлов на сервер

```
POST 
Content-type: multipart/form-data

https://localhost:3001/upload/
```

#### Обязательные POST-параметры:

```file``` - загружаемый файл

#### Обязательные GET-параметры:

```
room_id : Number
user_id : Number
token : String
type : String
```

Внимание: ``type`` может быть одним из четырех значений - ``voice``, ``video``, ``photo``, ``file``


#### Пример ответа
```json
{
  "success" : true,
  "attachment" : Attachment
}
```

### Получение файла

```
GET

https://localhost:3001/download/
```

#### Обязательные GET-параметры:

```
attachment_id : Number
user_id : Number
token : String
```
