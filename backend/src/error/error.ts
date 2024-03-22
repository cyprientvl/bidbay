export class MissingUser extends Error{

    constructor(message?: string){
        super(message);
    }
}

export class MissingBid extends Error{

}

export class BodyError extends Error{
    
    missingValue: string[];
    constructor(missingValue: string[]){
        super();
        this.missingValue = missingValue;
    }
}