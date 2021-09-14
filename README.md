# Чат (WebSocket + Express)

- [Подключение](#connect)
- [Действия](#do)
  - [Авторизация и получение списка диалогов](#do1)
  - [Новый диалог](#do2)
  - [Отправка сообщения](#do3)
  - [Удаление сообщения](#do4)
  - [Получить историю чата](#do5)
  - [Отметить чат прочитанным](#do6)
  - [Очистить историю чата](#do7)
  - [Удалить чат](#do8)
  - [Начать звонок (RTC)](#do9)
  - [Ответить на звонок (RTC)](#do10)
- [События](#events)
- [Типы данных](#types)

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
### Авторизация и получение списка диалогов
В ответ будет вызвано событие ```on.user.authorized```
```typescript
socket.emit('user.auth', {
    token : String
})
```
<a name="do1"></a>
### Новый диалог

В ответ будет вызвано событие ```on.messages.new```
```typescript
socket.emit('chat.start', {
    user_id : Number,
    text : String,
    file_id? : Number
})
```
<a name="do2"></a>
### Отправка сообщения

В ответ будет вызвано событие ```on.messages.new```
```typescript
socket.emit('message.send', {
    room_id : Number,
    text : String,
    file_id? : Number
})
```
<a name="do3"></a>
### Удаление сообщения

В ответ будет вызвано событие ```on.messages.delete```
```typescript
socket.emit('message.delete', {
    message_id : Number
})
```
<a name="do4"></a>
### Получить историю чата

В ответ будет вызвано событие ```on.chat.history```
```typescript
socket.emit('chat.history', {
    room_id : Number,
    limit? : Number,
    last_id? : Number
})
```
<a name="do5"></a>
### Отметить чат прочитанным

В ответ будет вызвано событие ```on.chat.read```
```typescript
socket.emit('chat.read', {
    room_id : Number
})
```
<a name="do6"></a>
### Очистить историю чата

В ответ будет вызвано событие ```on.chat.clear```
```typescript
socket.emit('chat.clear', {
    room_id : Number
})
```
<a name="do7"></a>
### Удалить чат

В ответ будет вызвано событие ```on.chat.clear```
```typescript
socket.emit('chat.delete', {
    room_id : Number
})
```
<a name="do8"></a>
### Начать звонок

В ответ будет вызвано событие ```on.call.init```
```typescript
socket.emit('call.start', {
    user_id : Number,
    ice_candidate : RTCIceCandidate,
    session_description : RTCSessionDescription
})
```
<a name="do9"></a>
### Ответить на звонок

В ответ будет вызвано событие ```on.call.answer```
```typescript
socket.emit('call.answer', {
    user_id : Number,
    ice_candidate : RTCIceCandidate,
    session_description : RTCSessionDescription
})
```
<a name="events"></a>
## События
### Авторизация
```typescript
socket.on('on.user.authorized', ({
    success : Boolean,
    dialogs : [
        { 
            chat : Chat, 
            room : Room 
        }
    ],
    user : User | null
}) => {})
```
### Новое сообщение
```typescript
socket.on('on.message.new', ({
    chat : Chat,
    room : Room,
    message : Message
}) => {})
```
### Сообщение удалено
```typescript
socket.on('on.message.delete', ({
    chat : Chat,
    room : Room,
    message : Message
}) => {})
```

### Чат удален
```typescript
socket.on('on.chat.delete', ({
    chat : Chat,
    room : Room
}) => {})
```

### Чат очищен
```typescript
socket.on('on.chat.clear', ({
    chat : Chat,
    room : Room
}) => {})
```

### Чат прочитан
```typescript
socket.on('on.chat.read', ({
    chat : Chat,
    room : Room
}) => {})
```

### Входящий звонок (RTC)
```typescript
socket.on('on.call.init', ({
    user : User,
    ice_candidate : Object,
    session_description : Object
}) => {})
```

### Вызов принят (RTC)
```typescript
socket.on('on.call.answer', ({
    user : User,
    ice_candidate : Object,
    session_description : Object
}) => {})
```

### Онлайн/оффлайн
```typescript
socket.on('on.user.online', ({
    id : Number,
    online : Boolean
}) => {})
```

### История чата загружена
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
    created_at : Date,
    message : Message | null
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