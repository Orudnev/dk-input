import React, { useEffect, useState } from 'react';
import { AddOrUpdateRow, DeleteRows, GetAllRows } from '../../web-api-wrapper';
import { IApiResponse, IDCItems, IJCommonRow, StatusEnum, TableNameEnum } from '../../common-types';
import { GridColDef, GridActionsCellItem, GridRowId, GridRowModesModel, GridRowModes, GridSlotProps, GridRowsProp, GridToolbarContainer, GridRenderCellParams, GridRowModel, GridRowSelectionModel } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { Sync } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import { RenderByStatus } from './renderers';
import { EditToolbar, WaitIcon } from './toolbar';

export function MainPage() {
  const [Rows, setRows] = useState<IJCommonRow[]>([]);
  const [LookupRows, setLookuprows] = useState<IJCommonRow[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [DestOptions, setDestOptions] = useState<any[]>([{ Name: "Loading..." }]);
  const [DCItemOptions, setDCItemOptions] = useState<IDCItems[]>([{ Name: "Loading...", Dest: "", Sign: 0 }]);
  const [waitSave, setWaitSave] = useState<string[]>([]);
  const [isSelectRowsMode, setIsSelectRowsMode] = useState<boolean>(false);
  const loadRows = () => {
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
        setRows(regularRows);
        setLookuprows(lrows);
      })
      .catch(err => {
        let s = 1;
      });
  };
  useEffect(() => {
    loadRows();
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

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    if (newRow.Status == StatusEnum.New) {
      newRow.Status = StatusEnum.NotProcessed;
    }
    let editedRowIndex = Rows.findIndex((row) => row.Id === newRow.Id);
    let newRows = [...Rows];
    AddOrUpdateRow(TableNameEnum.JCommon, newRow)
      .then((resp: any) => {
        let newValue = waitSave.filter(itm => itm != newRow.Id);
        setWaitSave(newValue);
      })
    newRows[editedRowIndex] = newRow as any;
    setRows(newRows);
    return newRow; // Обязательно вернуть строку
  };
  const handleSaveClick = (params: any) => () => {
    let newValue = [...waitSave];
    newValue.push(params.id);
    setWaitSave(newValue);
    setRowModesModel({ ...rowModesModel, [params.id]: { mode: GridRowModes.View } });
  };


  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    let editedRow: any = Rows.find((row) => row.Id === id);
    if (editedRow.Status == StatusEnum.New) {
      setRows(Rows.filter((row) => row.Status !== StatusEnum.New));
      return;
    }
  };

  const handleToolbarCmd = (cmd: string) => {
    let selectedRows:string[] = rowSelectionModel.map(itm => itm.toString());
    switch (cmd) {
      case "Delete":
        DeleteRows(TableNameEnum.JCommon, selectedRows)
        .then((resp: any) => {
          loadRows();
        });
        setRows([]);
        break;
      case "ToLookup":
        let requestList:Promise<any>[] = [];
        selectedRows.forEach((rowId) => {
          let crow = Rows.find((row) => row.Id === rowId);
          if(crow){
            crow.Status = StatusEnum.Lookup;
            requestList.push(AddOrUpdateRow(TableNameEnum.JCommon, crow));  
          }
        });
        Promise.all(requestList).then((resp: any) => {
          setRows([]);
          loadRows();
        });
        break
    }
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
              onClick={handleSaveClick(params)}
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
        if (waitSave.find(itm => itm == params.id) != undefined) {
          return [
            <GridActionsCellItem
              icon={<WaitIcon />}
              label="Sync"
              sx={{
                color: 'primary.main',
              }}
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
        ];
      }
    },
    { field: "DestTable", headerName: "Dest", width: 70, type: "singleSelect", valueOptions: ["BnBish", "BnSok", "BnMb", "Nal"], renderCell: RenderByStatus, editable: true },
    { field: "Date", headerName: "Date", type: "date", width: 95, renderCell: RenderByStatus, editable: true },
    { field: "DCItem", headerName: "DCItem", width: 80, type: "singleSelect", valueOptions: () => { return DCItemOptions.map((option) => option.Name); }, renderCell: RenderByStatus, editable: true },
    { field: "Description", headerName: "Description", width: 200, renderCell: RenderByStatus, editable: true },
    {
      field: "Dest", headerName: "Dest", width: 80, type: "singleSelect",
      valueOptions: () => {
        return DestOptions.map((option) => option.Name);
      }, renderCell: RenderByStatus, editable: true
    },
    { field: "Sum", headerName: "Sum", width: 100, type: "number", renderCell: RenderByStatus, editable: true }
  ];

  return (
    <div>
      <DataGrid getRowId={(row) => row.Id}
        rows={Rows}
        columns={JCommonColumns as any}
        editMode="row"
        rowModesModel={rowModesModel}
        rowHeight={25}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{ toolbar: { setRows: setRows, setRowModesModel, isSelectRowsMode, setIsSelectRowsMode, rowSelectionModel, setRowSelectionModel, handleToolbarCmd } }}
        checkboxSelection={isSelectRowsMode}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
      />
    </div>
  );

}