"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientStore = void 0;
class ClientStore {
    constructor(collection = []) {
        this.collection = collection;
    }
    each(fn) {
        this.collection.forEach(fn);
    }
    get(id) {
        return this.collection.find(e => e.id === id) || null;
    }
    has(id) {
        return this.collection.some(e => e.id === id);
    }
    filter(id) {
        return new ClientStore(this.collection.filter(client => {
            return id instanceof Array ? ~id.indexOf(client.id) : (client.id === id);
        }));
    }
    add(user) {
        this.collection.push(user);
    }
    remove(user) {
        let index = this.collection.indexOf(user);
        if (index >= 0) {
            this.collection.splice(index, 1);
        }
    }
    removeAll() {
        this.collection.length = 0;
    }
    static concat(...args) {
        return new ClientStore([].concat(...args));
    }
}
exports.ClientStore = ClientStore;
