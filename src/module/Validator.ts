export class Field{

    protected type : any;

    public required : boolean;
    public default : any;

    constructor(type : any, required : boolean = true, def : any = null) {
        this.type = type;
        this.required = required;
        this.default = def;
    }

    public validate(value : any) : boolean
    {

        if(typeof this.type === 'string'){

            if(this.type === 'number'){

                return typeof value === 'number' &&
                    value < Infinity &&
                    value > -Infinity;

            }

            return (this.type === '*') || (typeof value === this.type);

        }else if(typeof this.type === 'object'){
            return (value instanceof this.type);
        }

        return false;

    }

}

interface Fields{
    [key:string] : Field
}

interface Values{
    [key:string] : any
}

interface Result{
    [key:string] : any
}

export class Validator{

    protected fields : Fields;

    constructor(fields : Fields) {
        this.fields = fields;
    }

    public validate(data : Values) : Result | false {

        let result : Result = {};

        for(let name in this.fields){

            let field = this.fields[name],
                value = data[name];

            if(name in data){

                if(field.validate(value)){
                    result[name] = value;
                }else{
                    return false;
                }

            }else if(!field.required){
                result[name] = field.default;
            }else{
                return false;
            }

        }

        return result;

    }

}