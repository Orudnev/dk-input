import axios from "axios";
import { TableNameEnum } from "./common-types";

const webApiBaseUrl = 'https://script.google.com/macros/s/AKfycbwru_j1Gj39A86-fnjJIXzsgEGd8QCZd-epJRMH9JhlJZp1rEcah3OPhkbVWng_AsoyZw/exec';


export function GetAllRows(tableName:TableNameEnum):Promise<any>{
    return axios({
        url:webApiBaseUrl,
        method:'GET',
        params:{method:"getAllRows",table:tableName}
    });
}

export function AddOrUpdateRow(tableName:TableNameEnum):Promise<any>{
    return axios({
        url:webApiBaseUrl,
        method:'GET',
        params:{method:"getAllRows",table:tableName}
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


// export function GetAllRows(handler:(response:IApiResponse)=>void){
//     axios({
//         url:webApiBaseUrl,
//         method:'GET',
//         params:{method:'getAllRows'}
//     })
//     .then((response)=>{
//         if(handler){
//             if(response.data.isOk){
//                 let itemsSrc:any[] = response.data.result;
//                 let items:IItem[] = [];
//                 itemsSrc.forEach((itm) => {
//                     let newItm:IItem = {
//                             q:{lang:'en-US',text:itm.En},
//                             a:{lang:'ru-RU',text:itm.Ru},
//                             r:{lcnt:itm.lcnt?itm.lcnt:0,
//                                 fsa:itm.fsa?itm.fsa:0,
//                                 rsa:itm.rsa?itm.rsa:0,
//                                 ts:itm.ts?itm.ts:0}};
//                     items.push(newItm);
//                 });
//                 response.data.result = items;                
//                 handler(response.data);
//             } else {
//                 handler(response.data);
//             }
//         }
//     })
//     .catch((err)=>{
//         if(handler){
//             handler({isOk:false,result:[],error:err,eventObj:undefined});
//         }
//     }
//     );
// }
