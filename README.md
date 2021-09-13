# Чат (WebSocket + Express)

- Подключение
- Авторизация и получение списка диалогов
- Новый диалог
- Отправка сообщения
- Удаление сообщения
- Получить историю чата
- Отметить чат прочитанным
- Очистить историю чата
- Удалить чат
- Начать звонок (RTC)
- Ответить на звонок (RTC)
- События

## Подключение
```javascript
let socket = io('ws://localhost:3000', {
    path : '/',
    transports : ['websocket']
});
```

## Действия
### Авторизация и получение списка диалогов
В ответ будет вызвано событие ```on.user.authorized```
```javascript
socket.emit('user.auth', {
    token : String
})
```

### Новый диалог

В ответ будет вызвано событие ```on.messages.new```
```javascript
socket.emit('chat.start', {
    user_id : Number,
    text : String,
    file_id? : Number
})
```

### Отправка сообщения

В ответ будет вызвано событие ```on.messages.new```
```javascript
socket.emit('message.send', {
    room_id : Number,
    text : String,
    file_id? : Number
})
```

### Удаление сообщения

В ответ будет вызвано событие ```on.messages.delete```
```javascript
socket.emit('message.delete', {
    message_id : Number
})
```

### Получить историю чата

В ответ будет вызвано событие ```on.chat.history```
```javascript
socket.emit('chat.history', {
    room_id : Number,
    limit? : Number,
    last_id? : Number
})
```

### Отметить чат прочитанным

В ответ будет вызвано событие ```on.chat.read```
```javascript
socket.emit('chat.read', {
    room_id : Number
})
```

### Очистить историю чата

В ответ будет вызвано событие ```on.chat.clear```
```javascript
socket.emit('chat.clear', {
    room_id : Number
})
```

### Удалить чат

В ответ будет вызвано событие ```on.chat.clear```
```javascript
socket.emit('chat.delete', {
    room_id : Number
})
```

### Начать звонок

В ответ будет вызвано событие ```on.call.init```
```javascript
socket.emit('call.start', {
    user_id : Number,
    ice_candidate : RTCIceCandidate,
    session_description : RTCSessionDescription
})
```

### Ответить на звонок

В ответ будет вызвано событие ```on.call.answer```
```javascript
socket.emit('call.answer', {
    user_id : Number,
    ice_candidate : RTCIceCandidate,
    session_description : RTCSessionDescription
})
```

## События
### Авторизация
```javascript
socket.on('on.user.authorized', ({
    success : Boolean,
    dialogs : [{ chat : Chat, room : Room }],
    user : User | null
}) => {})
```
### Новое сообщение
```javascript
socket.on('on.message.new', ({
    chat : Chat,
    room : Room,
    message : Message
}) => {})
```
### Сообщение удалено
```javascript
socket.on('on.message.delete', ({
    chat : Chat,
    room : Room,
    message : Message
}) => {})
```

### Чат удален
```javascript
socket.on('on.chat.delete', ({
    chat : Chat,
    room : Room
}) => {})
```

### Чат очищен
```javascript
socket.on('on.chat.clear', ({
    chat : Chat,
    room : Room
}) => {})
```

### Чат прочитан
```javascript
socket.on('on.chat.read', ({
    chat : Chat,
    room : Room
}) => {})
```

### Входящий звонок (RTC)
```javascript
socket.on('on.call.init', ({
    user : User,
    ice_candidate : Object,
    session_description : Object
}) => {})
```

### Вызов принят (RTC)
```javascript
socket.on('on.call.answer', ({
    user : User,
    ice_candidate : Object,
    session_description : Object
}) => {})
```

### Онлайн/оффлайн
```javascript
socket.on('on.user.online', ({
    id : Number,
    online : Boolean
}) => {})
```

### История чата загружена
```javascript
socket.on('on.chat.history', ({
    messages : Message[],
    chat : Chat,
    room : Room
}) => {})
```