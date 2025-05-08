import { GeneratePseudoUniqueId } from "./web-api-wrapper";

export enum TableNameEnum{
    None = "",
    JCommon = "JCommon",
    BnBish = "BnBish",
    BnSok = "BnSok",
    BnMb = "BnMb",
    Nal = "Nal",
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

export interface ITotals{
    BnBish:number;
    BnSok:number;
    BnMb:number;
    Nal:number;
}

export function CreateNewJCommonRow(date?:Date):IJCommonRow{
    if(!date){
        date = new Date();
    }
    return { Id: GeneratePseudoUniqueId(), Date: date, DCItem: "", DestTable: TableNameEnum.None, Description: "", Dest: "", Sum: 0, Sign: -1, AddRowTime: new Date(), Status: StatusEnum.New };
}
export interface IDCItems{
    Name:string;
    Sign:number;
    Dest:string;
}

export interface IAppScriptResponse<T>{
    data:T;
}

export interface IApiResponse{
    isOk:boolean;
    receivedParams:any;
    error:any;
    eventObj:any;
    invokeMethodResult:any;
}

export function RestoreUtfOffset(date?:Date):Date{
    if(!date){
        date = new Date();
    }
    const offsetHours = new Date().getTimezoneOffset()/60;
    date.setHours(date.getHours() - offsetHours);
    return date;
}

