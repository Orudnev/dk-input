import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {IJCommonRow, StatusEnum, TableNameEnum } from "../../common-types";
import {CancelTwoTone, SaveTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GeneratePseudoUniqueId } from '../../web-api-wrapper';

export interface ISmartAddFormProps {
  lookupRows: IJCommonRow[];
  handleSubmit: (row?: IJCommonRow) => void;
}

export function SmartAddForm(props: ISmartAddFormProps) {
  const opt = props.lookupRows.map(itm => {return {label:itm.Description,id:itm.Id}});  
  const newRow:IJCommonRow = { Id: GeneratePseudoUniqueId(), Date: new Date(), DCItem: "",DestTable:TableNameEnum.None, Description: "", Dest: "", Sum: 0, Sign: -1, AddRowTime: new Date(), Status: StatusEnum.New };
  return (
    <div>
      <Button color="primary" startIcon={<CancelTwoTone />} onClick={() => props.handleSubmit(undefined)}>Cancel</Button>;
      <Button color="primary" startIcon={<SaveTwoTone />} onClick={() => props.handleSubmit(newRow)}>Save</Button>;
      <Autocomplete
        disablePortal
        options={opt}
        renderOption={(props, option) => <li {...props} key={option.id}>{option.label}</li>}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="" />}
        onChange={(event, value) => {
          const lookupRow = props.lookupRows.find(itm => itm.Id == value?.id);
          if(lookupRow){
              newRow.DestTable = lookupRow.DestTable;
              newRow.DCItem = lookupRow.DCItem;
              newRow.Description = lookupRow.Description;
              newRow.Dest = lookupRow.Dest;
              newRow.Sum = lookupRow.Sum;
              newRow.Sign = lookupRow.Sign;
              newRow.Status = StatusEnum.NotProcessed;            
          }
        }}
      />
    </div>
  )
}