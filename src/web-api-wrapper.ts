import axios from "axios";
import { IApiResponse, IAppScriptResponse, ITotals, TableNameEnum } from "./common-types";

const webApiBaseUrl = 'https://script.google.com/macros/s/AKfycbxP55AhGyxvLZiJqn7_SAmO74JOZGkHh4z-cl2MuyPapKckoR0EVtoFILcEOwnBdIPnAw/exec';



export function GetAllRows(tableName:TableNameEnum):Promise<any>{
    return axios({
        url:webApiBaseUrl,
        method:'GET',
        params:{method:"getAllRows",table:tableName}
    });
}

export function AddOrUpdateRow(tableName:TableNameEnum,row:any):Promise<any>{
    let rowJson = JSON.stringify(row);
    let rowB64 = utf8ToB64(rowJson); 
    return axios({
        url:webApiBaseUrl,
        method:'GET',
        params:{method:"addOrUpdateRow",table:tableName,row:rowB64}
    });
}

export function DeleteRows(tableName:TableNameEnum,rowIdArray:string[]):Promise<any>{
    let rowIdstr = "";
    rowIdArray.forEach((rowId) => {
        rowIdstr += (rowIdstr?",":"") +rowId;
    });
    return axios({
        url:webApiBaseUrl, 
        method:'GET',
        params:{method:"deleteRows",table:tableName,rowIds:rowIdstr}
    });
}

export function GetTotalsWithJcommon():Promise<IAppScriptResponse<IApiResponse>>{
    return axios({
        url:webApiBaseUrl, 
        method:'GET',
        params:{method:"getTotalsWithJcommon"}
    });
}

export function Commit():Promise<IAppScriptResponse<IApiResponse>>{
    return axios({
        url:webApiBaseUrl, 
        method:'GET',
        params:{method:"commit"}
    });
}

export function GeneratePseudoUniqueId(){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4); // Берем последние 4 символа от числа в 36-ричной системе
    const randomPart = Array.from({ length: 4 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    return timestamp + randomPart;
}

function utf8ToB64(str:string):string {
    // Преобразование строки в массив байт
    let bytes = [];
    
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      
      if (code <= 0x7F) {
        // 1 байт (ASCII символы)
        bytes.push(code);
      } else if (code <= 0x7FF) {
        // 2 байта (символы от 0x80 до 0x7FF)
        bytes.push(0xC0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3F));
      } else if (code <= 0xFFFF) {
        // 3 байта (символы от 0x800 до 0xFFFF)
        bytes.push(0xE0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3F));
        bytes.push(0x80 | (code & 0x3F));
      }
    }
  
    // Преобразование массива байт в строку
    let byteString = String.fromCharCode(...bytes);
  
    // Кодирование строки в Base64
    return btoa(byteString);
  }
