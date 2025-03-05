import React, { useEffect, useState } from 'react';
import { GetAllRows } from './web-api-wrapper';
import { IApiResponse, IDCItems, IJCommonRow, TableNameEnum } from './common-types';
import { GridColDef, GridActionsCellItem, GridRowId, GridRowModesModel, GridRowModes, GridSlotProps, GridRowsProp, GridToolbarContainer, GridRenderCellParams } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';



function App() {
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
        const regularRows = data.invokeMethodResult.filter((row: IJCommonRow) => row.Status < 3);
        const lrows = data.invokeMethodResult.filter((row: IJCommonRow) => row.Status > 2);
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
    { field: "DestTable", headerName: "Dest", width: 70, type: "singleSelect", valueOptions: ["BnBish","BnSok","BnMb","Nal"],renderCell:renderByStatus,  editable: true },
    { field: "Date", headerName: "Date", type: "date", width: 95,renderCell:renderByStatus, editable: true },
    { field: "DCItem", headerName: "DCItem", width: 80,type:"singleSelect",valueOptions:()=>{return DCItemOptions.map((option) => option.Name);}, editable: true },
    { field: "Description", headerName: "Description", width: 200, editable: true },
    { field: "Dest", headerName: "Dest", width: 80, type: "singleSelect", 
        valueOptions:()=>{
        return DestOptions.map((option) => option.Name);
      } , editable: true },
    { field: "Sum", headerName: "Sum", width: 100, type: "number", editable: true }
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


declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: IJCommonRow[]) => IJCommonRow[]) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
}


function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRows, setRowModesModel } = props;
  const newRowId = "NewRow";
  const handleClick = () => {
    setRows((oldRows:any) => [
      ...oldRows,
      { Id:newRowId,Date:new Date(),DCItem:"",Description:"",Dest:"",Sum:0,Sign:-1,AddRowTime:new Date(),Status:0 }
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [newRowId]: { mode: GridRowModes.Edit, fieldToFocus: 'Description' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

const renderByStatus = (params:GridRenderCellParams<any,any,any>)=>{
  if (params.value == null) {
    return '';
  }
  let status:number = params.row.Status as number;
  let st={opacity:1}
  if(status > 0){
    st={opacity:0.5}
  }
  return (
    <div style={st}>params.value.name</div>
  );  
}

export default App;
