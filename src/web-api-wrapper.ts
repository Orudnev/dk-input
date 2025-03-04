import axios from "axios";
import { TableNameEnum } from "./common-types";

const webApiBaseUrl = 'https://script.google.com/macros/s/AKfycbyQZ89bA0DqXNqbCA1284iBwxgUzGwh4S5-0IPpPJ8spAUrgMTw_H0W361KtcOg_G4DEg/exec';



export function GetAllRows(tableName:TableNameEnum):Promise<any>{
    return axios({
        url:webApiBaseUrl,
        method:'GET',
        params:{method:"getAllRows",table:tableName}
    });
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
