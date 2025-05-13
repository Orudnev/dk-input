import { Reducer } from 'redux';
import { IAllTablesContentDTO } from '../common-types';


export interface IAppSettings {
    testSetting: string;
    tablesContent:IAllTablesContentDTO
}
export const initAppSettings: IAppSettings = {
    testSetting:"blablabla",
    tablesContent:{
        JCommon:[],
        BnBish:[],
        BnSok:[],
        BnMb:[],
        Nal:[],
        Dest:[],
        DCItems:[]
    }
};

export interface ITestAction{
    type:"TestAction",
    testSetting:string
}

export interface IAllTablesContent{
    type:"AllTablesContent";
    tablesContent:IAllTablesContentDTO
}

export type TAppAction = ITestAction|IAllTablesContent;

const appReducer:Reducer<IAppSettings,TAppAction> = (state = initAppSettings,action)=>{
    let newState = {...state};
    switch (action.type){
        case "AllTablesContent":
            newState.tablesContent = action.tablesContent;
            return newState;
        case 'TestAction':
            newState.testSetting = action.testSetting;
            return newState;
            break; 
            
    }
    return state;
}   

export default appReducer;