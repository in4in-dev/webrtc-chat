export class Env{

    public static get(name : string, def : string = '') : string
    {
        return process.env[name] || def;
    }

}