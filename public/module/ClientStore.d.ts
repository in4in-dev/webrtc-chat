import { Client } from "./Client";
export declare class ClientStore {
    protected collection: Array<Client>;
    constructor(collection?: Client[]);
    each(fn: (u: Client) => void): void;
    get(id: number): Client | null;
    has(id: number): boolean;
    filter(id: number | number[]): ClientStore;
    add(user: Client): void;
    remove(user: Client): void;
    removeAll(): void;
    static concat(...args: ClientStore[]): ClientStore;
}
