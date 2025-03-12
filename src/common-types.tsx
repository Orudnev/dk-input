export enum TableNameEnum{
    None = "",
    JCommon = "JCommon",
    BnBish = "BnBish",
    Dest = "Dest",
    DCItems = "DCItems"
}

export enum StatusEnum{
    New = -1,
    NotProcessed = 0,
    InProcess = 1,
    Processed = 2,
    Lookup = 3
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

export interface IDCItems{
    Name:string;
    Sign:number;
    Dest:string;
}

export interface IApiResponse{
    isOk:boolean;
    receivedParams:any;
    error:any;
    eventObj:any;
    invokeMethodResult:any;
}

