import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { CreateNewJCommonRow, IJCommonRow, StatusEnum, TableNameEnum } from "../../common-types";
import { CancelTwoTone, SaveTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GeneratePseudoUniqueId } from '../../web-api-wrapper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

export interface ISmartAddFormProps {
  lookupRows: IJCommonRow[];
  handleSubmit: (row?: IJCommonRow) => void;
}

export function SmartAddForm(props: ISmartAddFormProps) {
  const opt = props.lookupRows.map(itm => { return { label: itm.Description, id: itm.Id } });
  const [newRow, setNewRow] = React.useState<any>(CreateNewJCommonRow());
  let destTableValue: TableNameEnum = newRow.DestTable;
  return (
    <div>
      <Button color="primary" startIcon={<CancelTwoTone />} onClick={() => props.handleSubmit(undefined)}>Cancel</Button>
      <Button color="primary" startIcon={<SaveTwoTone />} onClick={() => props.handleSubmit(newRow)}>Save</Button>
      <div style={{marginTop: '10px'}}>
        <FormControl>
          <Autocomplete
            className='form-field'
            disablePortal
            options={opt}
            renderOption={(props, option) => <li {...props} key={option.id}>{option.label}</li>}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label="Description" />}
            onChange={(event, value) => {
              const lookupRow = props.lookupRows.find(itm => itm.Id == value?.id);
              if (lookupRow) {
                const row = { ...newRow };
                row.DestTable = lookupRow.DestTable;
                row.DCItem = lookupRow.DCItem;
                row.Description = lookupRow.Description;
                row.Dest = lookupRow.Dest;
                row.Sum = lookupRow.Sum;
                row.Sign = lookupRow.Sign;
                row.Status = StatusEnum.NotProcessed;
                setNewRow(row);
              }
            }}
          />
        </FormControl>
        <FormControl>
          <InputLabel id="lblDestTable">Destination table</InputLabel>
          <Select label={"Destination table"} id="fldDestTable" labelId='lblDestTable'
            className="form-field"
            value={newRow.DestTable}
            onChange={(event: SelectChangeEvent) => {
              let row = { ...newRow };
              row.DestTable = event.target.value as TableNameEnum;
              setNewRow(row);
            }}
          >
            <MenuItem value={TableNameEnum.None}>None</MenuItem>
            <MenuItem value={TableNameEnum.BnBish} >{TableNameEnum.BnBish}</MenuItem>
            <MenuItem value={TableNameEnum.BnSok} >{TableNameEnum.BnSok}</MenuItem>
            <MenuItem value={TableNameEnum.BnMb}>{TableNameEnum.BnMb}</MenuItem>
            <MenuItem value={TableNameEnum.Nal} >{TableNameEnum.Nal}</MenuItem>
          </Select>
        </FormControl>
      </div>
    </div>
  )
}