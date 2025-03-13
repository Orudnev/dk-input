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

export function CreateNewJCommonRow():IJCommonRow{
    return { Id: GeneratePseudoUniqueId(), Date: new Date(), DCItem: "", DestTable: TableNameEnum.None, Description: "", Dest: "", Sum: 0, Sign: -1, AddRowTime: new Date(), Status: StatusEnum.New };
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

