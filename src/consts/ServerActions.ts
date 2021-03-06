//События на клиенте
//Отправляет сервер

export default {

    DELETE_CHAT : 'on.chat.delete',
    CLEAR_CHAT : 'on.chat.clear',
    HISTORY_LOADED : 'on.chat.history',
    READ_CHAT : 'on.chat.read',

    NEW_MESSAGE : 'on.message.new',
    DELETE_MESSAGE : 'on.message.delete',

    AUTHORIZED : 'on.user.authorized',

    USER_ONLINE : 'on.user.online',

    CALL_INIT : 'on.call.start',
    CALL_ANSWER : 'on.call.answer',
    CALL_ICE : 'on.call.ice',

    ERROR : 'on.error',

    DO_SOMETHING : 'on.chat.do_something'

}