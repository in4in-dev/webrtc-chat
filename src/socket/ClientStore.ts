import {Client} from "./Client";

export class ClientStore {

    protected collection : Array<Client>;

    constructor(collection : Client[] = []) {
        this.collection = collection;
    }

    public each(fn : (u : Client) => void) : void
    {
        this.collection.forEach(fn);
    }

    public emit(action : string, fn : (u : Client) => any) : void
    {
        this.each(cl => {
           cl.connection.emit(action, fn(cl));
        });
    }

    public get(id : number) : Client | null
    {
        return this.collection.find(e => e.id === id) || null;
    }

    public has(id : number) : boolean
    {
        return this.collection.some(e => e.id === id);
    }

    public filter(id : number | number[]) : ClientStore
    {

        return new ClientStore(
            this.collection.filter(client => {
                return id instanceof Array ? ~id.indexOf(client.id!) : (client.id === id)
            })
        );

    }

    public add(user : Client) : void
    {
        this.collection.push(user);
    }

    public remove(user : Client) : void
    {

        let index = this.collection.indexOf(user);

        if(index >= 0){
            this.collection.splice(index, 1);
        }

    }

    public removeAll(){
        this.collection.length = 0;
    }

    public static concat(...args : ClientStore[]) : ClientStore
    {
        return new ClientStore(
            [].concat(...args as any[])
        );
    }


}