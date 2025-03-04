export enum TableNameEnum{
    JCommon = "JCommon",
    BnBish = "BnBish"
}

export interface IJCommonRow{
    Id:string;
    DestTable:TableNameEnum;
    Date:Date,
    DCItem:string,
    Description:string,
    Dest:string,
    Sum:number,
    Sign:number,
    AddRowTime:Date,
    Status:number
}

export interface IApiResponse{
    isOk:boolean;
    receivedParams:any;
    error:any;
    eventObj:any;
    invokeMethodResult:any;
}

