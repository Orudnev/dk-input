import { GeneratePseudoUniqueId } from "./web-api-wrapper";

export const appVersion = "1.0.4";

export enum TableNameEnum {
    None = "",
    JCommon = "JCommon",
    BnBish = "BnBish",
    BnSok = "BnSok",
    BnMb = "BnMb",
    Nal = "Nal",
    Dest = "Dest",
    DCItems = "DCItems"
}


class AllTablesWrapperClass {
    emptyValue: IAllTablesContentDTO = {
        JCommon: [],
        BnBish: [],
        BnSok: [],
        BnMb: [],
        Nal: [],
        Dest: [],
        DCItems: []
    };
    hasValue(): boolean {
        let strVal = localStorage.getItem("allTables");
        return strVal ? true : false;
    }
    get(): IAllTablesContentDTO {
        let strVal = localStorage.getItem("allTables");
        if (!strVal) {
            return this.emptyValue;
        }
        let obj = JSON.parse(strVal);
        try {
            let result = obj as IAllTablesContentDTO;
            result.JCommon.forEach(row => {
                if (row.AddRowTime) {
                    row.AddRowTime = new Date(row.AddRowTime);
                }
                if (row.Date) {
                    row.Date = new Date(row.Date);
                }
            });
            return result;
        } catch (e) {
            return this.emptyValue;
        }
    }
    set(rawData: any) {
        let allTblContentDTO: IAllTablesContentDTO = {
            JCommon: this.convertArrayToJCommonRows(rawData.JCommon),
            BnBish: this.convertArrayToAccountRows(rawData.BnBish),
            BnSok: this.convertArrayToAccountRows(rawData.BnSok),
            BnMb: this.convertArrayToAccountRows(rawData.BnMb),
            Nal: this.convertArrayToAccountRows(rawData.Nal),
            Dest: (() => rawData.Dest.map((itm: any) => itm[0]))(),
            DCItems: this.convertArrayToDCItemRows(rawData.DCItems)
        }
        localStorage.setItem("allTables", JSON.stringify(allTblContentDTO));
    }

    getLastEditedRow(): IJCommonRow | undefined {
        let allJcRows = this.get().JCommon;
        if (allJcRows.length == 0) {
            return undefined;
        } 
        let lrow = allJcRows.reduce((max: any, item: any) => {
            let result = item.AddRowTime > max.AddRowTime ? item : max;
            return result;
        });
        return lrow;
    }
    addOrUpdateJCommonRow(row: IJCommonRow) {
        let allJcRows = this.get().JCommon;
        let index = allJcRows.findIndex((r: IJCommonRow) => r.Id == row.Id);
        if (index == -1) {
            allJcRows.push(row);
        } else {
            allJcRows[index] = row;
        }
        let allTables = this.get();
        allTables.JCommon = allJcRows;
        localStorage.setItem("allTables", JSON.stringify(allTables));
    }
    getRegularRows(): IJCommonRow[] {
        let allTblContent = this.get();
        let result = allTblContent.JCommon.filter((row: IJCommonRow) => row.Status < StatusEnum.Lookup);
        return result;
    }
    getLookupRows(): IJCommonRow[] {
        let allTblContent = this.get();
        let result = allTblContent.JCommon.filter((row: IJCommonRow) => row.Status == StatusEnum.Lookup);
        return result;
    }

    getLookupRowFromAllTables(): IJCommonRow[] {
        const allTblContent = this.get();        
        let allTblResult:IJCommonRow[] = [];
        const getLookupRows = (destTable: TableNameEnum) => {
            const table:IAccountRow[] = (allTblContent as any)[destTable];
            const result:IJCommonRow[] = [];
            table.forEach((row: IAccountRow) => {
                if(row.Description.toLocaleLowerCase()=="лепешки")
                {
                    let s = 1;
                } 
                const alreadyAdded = result.find(lrow=>lrow.Description.toLowerCase() == row.Description.toLowerCase());               
                if(alreadyAdded){
                    return;
                }
                let newRow:IJCommonRow = {
                    Id: GeneratePseudoUniqueId(),
                    Date: new Date(),
                    DestTable: destTable,
                    DCItem: row.DCItem,
                    Description: row.Description,
                    Dest: row.Dest,
                    Sum: row.Sum,
                    Sign: row.Sign,
                    AddRowTime: new Date(),
                    Status: StatusEnum.Lookup
                }
                result.push(newRow);                    
            });
            return result;
        }        
        allTblResult = allTblResult.concat(getLookupRows(TableNameEnum.BnBish));
        allTblResult = allTblResult.concat(getLookupRows(TableNameEnum.BnMb));
        allTblResult = allTblResult.concat(getLookupRows(TableNameEnum.BnSok));
        allTblResult = allTblResult.concat(getLookupRows(TableNameEnum.Nal));
        return allTblResult;
    }   

    getTotals(): ITotals {
        let calcTotals = (rows: IAccountRow[], tableName: string) => {
            let accTotals = rows.reduce((acc, row) => {
                if (row.DCItem == 'Вх.Остаток') {
                    return row.Total;
                }
                return acc + row.Sum * row.Sign;
            }, 0);
            let jcTotals = currJcRows.filter(row => row.DestTable == tableName && (row.Status == undefined || row.Status == 0)).reduce((acc, row) => acc + row.Sum * row.Sign, 0);
            return accTotals + jcTotals;
        }
        let currJcRows = this.get().JCommon;
        let allTblContent = this.get();
        let result: ITotals = {
            BnBish: calcTotals(allTblContent.BnBish, "BnBish"),
            BnMb: calcTotals(allTblContent.BnMb, "BnMb"),
            BnSok: calcTotals(allTblContent.BnSok, "BnSok"),
            Nal: calcTotals(allTblContent.Nal, "Nal")
        };
        return result;
    }
    convertArrayToJCommonRows(rows: any[]): IJCommonRow[] {
        let result: IJCommonRow[] = [];
        rows.forEach((row) => {
            let newRow: IJCommonRow = {
                Id: row[0],
                DestTable: row[1],
                Date: new Date(row[2]),
                DCItem: row[3],
                Description: row[4],
                Dest: row[5],
                Sum: row[6],
                Sign: row[7],
                AddRowTime: new Date(row[8]),
                Status: row[9]
            };
            result.push(newRow);
        });
        return result;
    }

    convertArrayToAccountRows(rows: any[]): IAccountRow[] {
        let result: IAccountRow[] = [];
        rows.forEach((row) => {
            let newRow: IAccountRow = {
                Id: row[0],
                Date: new Date(row[1]),
                DCItem: row[2],
                Dest: row[3],
                Description: row[4],
                Sum: row[5],
                Sign: row[6],
                Total: row[7],
                Status: row[8]
            };
            result.push(newRow);
        });
        return result;
    }

    convertArrayToDCItemRows(rows: any[]): IDCItems[] {
        let result: IDCItems[] = [];
        rows.forEach((row) => {
            let newRow: IDCItems = {
                Name: row[0],
                Sign: row[1],
                Dest: row[2]
            };
            result.push(newRow);
        });
        return result;
    }
}
export const AllTablesWrapper = new AllTablesWrapperClass();

export enum StatusEnum {
    New = -1,
    NotProcessed = 0,
    InProcess = 1,
    Processed = 2,
    Lookup = 3
}

export interface IJCommonRow {
    Id: string;
    DestTable: TableNameEnum;
    Date: Date,
    DCItem: string,
    Description: string,
    Dest: string,
    Sum: number,
    Sign: number,
    AddRowTime: Date,
    Status: number
}

export interface IAccountRow {
    Id: string;
    Date: Date;
    DCItem: string;
    Dest: string;
    Description: string,
    Sum: number;
    Sign: number;
    Total: number;
    Status: number;
}


export interface IAllTablesContentDTO {
    JCommon: IJCommonRow[];
    BnBish: IAccountRow[];
    BnSok: IAccountRow[];
    BnMb: IAccountRow[];
    Nal: IAccountRow[];
    Dest: string[];
    DCItems: IDCItems[];
}

export interface ITotals {
    BnBish: number;
    BnSok: number;
    BnMb: number;
    Nal: number;
}

export function CreateNewJCommonRow(date?: Date): IJCommonRow {
    if (!date) {
        date = new Date();
    }
    return { Id: GeneratePseudoUniqueId(), Date: date, DCItem: "", DestTable: TableNameEnum.None, Description: "", Dest: "", Sum: 0, Sign: -1, AddRowTime: new Date(), Status: StatusEnum.New };
}
export interface IDCItems {
    Name: string;
    Sign: number;
    Dest: string;
}

export interface IAppScriptResponse<T> {
    data: T;
}

export interface IApiResponse {
    isOk: boolean;
    receivedParams: any;
    error: any;
    eventObj: any;
    invokeMethodResult: any;
}



