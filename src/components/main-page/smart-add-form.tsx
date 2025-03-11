import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IJCommonRow } from "../../common-types";


export interface ISmartAddFormProps{
    lookupRows:IJCommonRow[];
    handleSubmit:(row:IJCommonRow)=>void;
}

export function SmartAddForm(props:ISmartAddFormProps){
    const opt = props.lookupRows.map(itm=>itm.Description);
    return (
    <Autocomplete
      disablePortal
      options={opt}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="" />}
    />
    )
}