export class DefaultResponse{

    public success : boolean;
    public data = {};

    constructor(success : boolean, data : { [key:string] : any }) {
        this.success = success;
        this.data = data;
    }

    toJSON(){

        return {
            success : this.success,
            ...this.data
        }

    }

}