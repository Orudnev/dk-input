import React, { useEffect, useState } from 'react';
import { GetAllRows } from '../../web-api-wrapper';
import { IApiResponse, IDCItems, IJCommonRow, StatusEnum, TableNameEnum } from '../../common-types';
import { GridColDef, GridActionsCellItem, GridRowId, GridRowModesModel, GridRowModes, GridSlotProps, GridRowsProp, GridToolbarContainer, GridRenderCellParams } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { RenderByStatus } from './renderers';
import { EditToolbar } from './toolbar';

export function MainPage(){
    const [InitialRows, setInitialRows] = useState<IJCommonRow[]>([]);
    const [CurrentRows, setCurrentRows] = useState<IJCommonRow[]>([]);
    const [LookupRows, setLookuprows] = useState<IJCommonRow[]>([]);
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [DestOptions, setDestOptions] = useState<any[]>([{ Name: "Loading..."}]);
    const [DCItemOptions,setDCItemOptions] = useState<IDCItems[]>([{ Name: "Loading...",Dest:"",Sign:0}]);
    useEffect(() => {
      GetAllRows(TableNameEnum.JCommon)
        .then((resp: any) => {
          return resp.data;
        })
        .then((data: IApiResponse) => {
          data.invokeMethodResult.forEach((row: IJCommonRow) => {
            row.Date = new Date(row.Date);
          });
          const regularRows = data.invokeMethodResult.filter((row: IJCommonRow) => row.Status < StatusEnum.Lookup);
          const lrows = data.invokeMethodResult.filter((row: IJCommonRow) => row.Status == StatusEnum.Lookup);
          setInitialRows(regularRows);
          setCurrentRows(regularRows);
          setLookuprows(lrows);
        })
        .catch(err => {
          let s = 1;
        });
      GetAllRows(TableNameEnum.Dest)
        .then((resp: any) => {
          setDestOptions(resp.data.invokeMethodResult);
        });
      GetAllRows(TableNameEnum.DCItems)
        .then((resp: any) => {
          setDCItemOptions(resp.data.invokeMethodResult)
      })  
    }, []);
    const handleEditClick = (id: GridRowId) => () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };
    const handleSaveClick = (id: GridRowId) => () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };
    const handleCancelClick = (id: GridRowId) => () => {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });
      
      let editedRowCurr: any = CurrentRows.find((row) => row.Id === id);
      if (editedRowCurr.Status == StatusEnum.New){
        setCurrentRows(CurrentRows.filter((row) => row.Status !== StatusEnum.New));
        return;
      }
      const editedRowOrig = InitialRows.find((row) => row.Id === id);
      editedRowCurr = { ...editedRowOrig }
    };
    const handleDeleteClick = (id: GridRowId) => () => {
      setCurrentRows(CurrentRows.filter((row) => row.Id !== id));
    };
  
    const JCommonColumns: GridColDef<IJCommonRow>[] = [
      {
        field: 'actions', type: 'actions', headerName: 'Actions', width: 70, cellClassName: 'actions', getActions: (params: any) => {
          const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;
          if (isInEditMode) {
            return [
              <GridActionsCellItem
                icon={<SaveIcon />}
                label="Save"
                sx={{
                  color: 'primary.main',
                }}
                onClick={handleSaveClick(params.id)}
              />,
              <GridActionsCellItem
                icon={<CancelIcon />}
                label="Cancel"
                className="textPrimary"
                onClick={handleCancelClick(params.id)}
                color="inherit"
              />,
            ];
          }
          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              disabled={params.row.Status > StatusEnum.NotProcessed}
              label="Edit"
              className="textPrimary"
              onClick={handleEditClick(params.id)}
              color="inherit"
            />,
            <GridActionsCellItem
              icon={<DeleteIcon />}
              label="Delete"
              onClick={handleDeleteClick(params.id)}
              color="inherit"
            />,
          ];
        }
      },
      { field: "DestTable", headerName: "Dest", width: 70, type: "singleSelect", valueOptions: ["BnBish","BnSok","BnMb","Nal"],renderCell:RenderByStatus,  editable: true },
      { field: "Date", headerName: "Date", type: "date", width: 95,renderCell:RenderByStatus, editable: true },
      { field: "DCItem", headerName: "DCItem", width: 80,type:"singleSelect",valueOptions:()=>{return DCItemOptions.map((option) => option.Name);},renderCell:RenderByStatus, editable: true },
      { field: "Description", headerName: "Description", width: 200,renderCell:RenderByStatus, editable: true },
      { field: "Dest", headerName: "Dest", width: 80, type: "singleSelect", 
          valueOptions:()=>{
          return DestOptions.map((option) => option.Name);
        } ,renderCell:RenderByStatus, editable: true },
      { field: "Sum", headerName: "Sum", width: 100, type: "number",renderCell:RenderByStatus, editable: true }
    ];
  
    return (
      <div>
        <DataGrid getRowId={(row) => row.Id}
          rows={CurrentRows}
          columns={JCommonColumns}
          editMode="row"
          rowModesModel={rowModesModel}
          rowHeight={25}
          slots={{toolbar:EditToolbar}}
          slotProps={{toolbar:{setRows:setCurrentRows,setRowModesModel}}}
        />
      </div>
    );
  
}