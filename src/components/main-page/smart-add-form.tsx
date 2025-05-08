import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { CreateNewJCommonRow, IDCItems, IJCommonRow, RestoreUtfOffset, StatusEnum, TableNameEnum } from "../../common-types";
import { CancelTwoTone, SaveTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GeneratePseudoUniqueId } from '../../web-api-wrapper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';





export interface IInpField {
  fldName: string;
  type?: React.InputHTMLAttributes<unknown>['type'];
  label?: string;
  style?: React.CSSProperties;
  row: any;
  onChange: (updatedRow: any) => void;
}

export interface IComboBox extends IInpField {
  options: string[]
}


export interface ISmartAddFormProps {
  lookupRows: IJCommonRow[];
  dcItemOptions: IDCItems[];
  destOptions: any[];
  handleSubmit: (row?: IJCommonRow) => void;
  lastEditedRow?:IJCommonRow|null;
}

export function SmartAddForm(props: ISmartAddFormProps) {
  const opt = props.lookupRows.map(itm => { return { label: itm.Description, id: itm.Id } });
  const [newRow, setNewRow] = React.useState<any>(CreateNewJCommonRow(RestoreUtfOffset(props.lastEditedRow?.Date)));
  return (
    <div>
      <Button color="primary" startIcon={<CancelTwoTone />} onClick={() => props.handleSubmit(undefined)}>Cancel</Button>
      <Button color="primary" startIcon={<SaveTwoTone />} onClick={() => props.handleSubmit(newRow)}>Save</Button>
      <Box style={{ marginTop: '10px', width: 500, border: '2px solid lightgray', borderRadius: '10px', padding: '10px' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                const row = { ...newRow };
                if (lookupRow) {
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
          <InpField fldName="Sum" type='number' onChange={setNewRow} row={newRow} label='Sum' />
          <ComboBox
            fldName="DestTable" label="Destination table"
            row={newRow}
            style={{ width: 180 }}
            onChange={setNewRow} options={[TableNameEnum.BnBish, TableNameEnum.BnSok, TableNameEnum.BnMb, TableNameEnum.Nal]}
          />
          <InpField fldName="Date" type='date'
            onChange={setNewRow}
            row={newRow} />
          <ComboBox
            fldName="DCItem"
            row={newRow}
            style={{ width: 140 }}
            onChange={setNewRow} options={props.dcItemOptions.map(itm => itm.Name)}
          />
          <ComboBox
            fldName="Dest"
            row={newRow}
            style={{ width: 140 }}
            onChange={setNewRow} options={props.destOptions.map(itm => itm.Name)}
          />
        </LocalizationProvider>
      </Box>
    </div>
  )
}


function InpField(props: IInpField) {
  const caption = props.label ? props.label : props.fldName;
  if (props.type === 'date') {
    const dateValueStr = props.row[props.fldName].toISOString().substring(0,10);
    const dateValue = dayjs(dateValueStr);
    return (
      <DatePicker
        label={caption}
        className='form-field'
        value={dateValue}
        onChange={(newValue:any) => {
          let newrow = { ...props.row };
          if(newValue){
            newrow[props.fldName] = RestoreUtfOffset(newValue);
            props.onChange(newrow);            
          }
        }} />
    );
  }
  return (
    <FormControl>
      <TextField
        label={caption}
        className='form-field'
        value={props.row[props.fldName]}
        id={props.fldName}
        onChange={(event) => {
          let newrow = { ...props.row };
          let newValueStr = event.target.value;
          if (props.type === 'text') {
            newrow[props.fldName] = newValueStr;
          } else if (props.type === 'number') {
            newrow[props.fldName] = Number(newValueStr);
          }
          props.onChange(newrow);
        }}
      />
    </FormControl>
  );
}
function ComboBox(props: IComboBox) {
  const caption = props.label ? props.label : props.fldName;
  return (
    <FormControl>
      <InputLabel id={`"lbl"${props.fldName}`}>{caption}</InputLabel>
      <Select
        label={caption}
        id={`"fld"${props.fldName}`} labelId={`"lbl"${props.fldName}`}
        className='form-field'
        style={props.style}
        value={props.row[props.fldName]}
        onChange={(event: SelectChangeEvent) => {
          let newrow = { ...props.row };
          newrow[props.fldName] = event.target.value;
          newrow.AddRowTime = new Date();
          props.onChange(newrow);
        }}
      >
        {props.options.map((opt: string) => {
          return (<MenuItem key={opt} value={opt}>{opt}</MenuItem>);
        })}
      </Select>
    </FormControl>
  );
}




