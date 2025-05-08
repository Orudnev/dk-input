import React, { useEffect, useState } from 'react';
import { AddOrUpdateRow, DeleteRows, GetAllRows, GetTotalsWithJcommon } from '../../web-api-wrapper';
import { IApiResponse, IAppScriptResponse, IDCItems, IJCommonRow, ITotals, StatusEnum, TableNameEnum } from '../../common-types';
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
import { styled } from '@mui/material/styles';
import { SmartAddForm } from './smart-add-form';
import "./page.css";
import { Totals } from './totals';


export enum MainPageMode {
  Regular,
  SelectRows,
  SmartAddRow
}
export function MainPage() {
  const [Rows, setRows] = useState<IJCommonRow[]>([]);
  const undefinedTotals: ITotals = { BnBish: -1, BnSok: -1, BnMb: -1, Nal: -1 };
  const [totalsData, setTotalsData] = useState<ITotals>(undefinedTotals);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const [LookupRows, setLookuprows] = useState<IJCommonRow[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [DestOptions, setDestOptions] = useState<any[]>([{ Name: "Loading..." }]);
  const [DCItemOptions, setDCItemOptions] = useState<IDCItems[]>([{ Name: "Loading...", Dest: "", Sign: 0 }]);
  const [waitSave, setWaitSave] = useState<string[]>([]);
  const [mainPageMode, setMainPageMode] = useState<MainPageMode>(MainPageMode.Regular);
  const loadRows = () => {
    setIsLoading(true);
    GetAllRows(TableNameEnum.JCommon)
      .then((resp: any) => {
        return resp.data;
      })
      .then((data: IApiResponse) => {
        setIsLoading(false);
        data.invokeMethodResult.forEach((row: IJCommonRow) => {
          row.Date = new Date(row.Date);
          row.AddRowTime = new Date(row.AddRowTime);
        });
        const regularRows = data.invokeMethodResult.filter((row: IJCommonRow) => row.Status < StatusEnum.Lookup);
        const lrows = data.invokeMethodResult.filter((row: IJCommonRow) => row.Status == StatusEnum.Lookup);
        setRows(regularRows);
        setTotalsData(undefinedTotals);
        GetTotalsWithJcommon().then((resp: IAppScriptResponse<IApiResponse>) => {
          if (!resp.data.isOk) {
            setTotalsData(undefinedTotals);
            return;
          }
          setTotalsData(resp.data.invokeMethodResult);
        }).catch(err => {
          var s = 1;
        });
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
        setIsLoading(false);
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
    newRow.AddRowTime = new Date();
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
    let selectedRows: string[] = rowSelectionModel.map(itm => itm.toString());
    switch (cmd) {
      case "Delete":
        DeleteRows(TableNameEnum.JCommon, selectedRows)
          .then((resp: any) => {
            loadRows();
          });
        setRows([]);
        break;
      case "ToLookup":
        let requestList: Promise<any>[] = [];
        selectedRows.forEach((rowId) => {
          let crow = Rows.find((row) => row.Id === rowId);
          if (crow) {
            crow.Status = StatusEnum.Lookup;
            requestList.push(AddOrUpdateRow(TableNameEnum.JCommon, crow));
          }
        });
        Promise.all(requestList).then((resp: any) => {
          setRows([]);
          loadRows();
        });
        break;
      case "SmartAdd":
        setMainPageMode(MainPageMode.SmartAddRow);
        break;
      // case "Cancel":
      //   setMainPageMode(MainPageMode.Regular);
      //   break;
      // case "Save":
      //   setMainPageMode(MainPageMode.Regular);
      //   break;
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
    { field: "DestTable", headerName: "DstTbl", width: 70, type: "singleSelect", valueOptions: ["BnBish", "BnSok", "BnMb", "Nal"], renderCell: RenderByStatus, editable: true },
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
  let noRowsComponent: any;
  if (IsLoading) {
    noRowsComponent = WaitLoadingRows;
  } else {
    noRowsComponent = NoRows;
  }
  if (mainPageMode === MainPageMode.SmartAddRow) {
    let last_EditedRow = null;
    if(Rows.length > 0){
      last_EditedRow = Rows.reduce((max: any, item: any) => {
        let result = item.AddRowTime > max.AddRowTime ? item : max;
        return result;
      });  
    }
    return (
      <div>
        <SmartAddForm lookupRows={LookupRows} dcItemOptions={DCItemOptions} destOptions={DestOptions} handleSubmit={(newRow) => {
          if (!newRow) {
            setRowSelectionModel([]);
            setMainPageMode(MainPageMode.Regular);
            return;
          }
          const newRows = [...Rows];
          newRows.push(newRow);
          let newWaitSave = [...waitSave];
          newWaitSave.push(newRow.Id);
          setRows(newRows);
          setWaitSave(newWaitSave);
          AddOrUpdateRow(TableNameEnum.JCommon, newRow)
            .then((resp: any) => {
              let newWaitSave = waitSave.filter(itm => itm != newRow.Id);
              setWaitSave(newWaitSave);
            })
          setMainPageMode(MainPageMode.Regular);
        }}
          lastEditedRow={last_EditedRow}
        />
      </div>
    );
  }
  return (
    <div className='main-page'>
      <Totals {...totalsData} />
      <DataGrid getRowId={(row) => row.Id}
        rows={Rows}
        columns={JCommonColumns as any}
        editMode="row"
        rowModesModel={rowModesModel}
        rowHeight={25}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar, noRowsOverlay: noRowsComponent }}
        slotProps={{ toolbar: { setRows: setRows, setRowModesModel, mainPageMode, setMainPageMode, rowSelectionModel, setRowSelectionModel, handleToolbarCmd } }}
        checkboxSelection={mainPageMode === MainPageMode.SelectRows}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
      />
    </div>
  );

}


const StyledGridOverlay = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  '& .no-rows-primary': {
    fill: '#3D4751',
    ...theme.applyStyles('light', {
      fill: '#AEB8C2',
    }),
  },
  '& .no-rows-secondary': {
    fill: '#1D2126',
    ...theme.applyStyles('light', {
      fill: '#E8EAED',
    }),
  },
}));
function WaitLoadingRows() {
  return (
    <StyledGridOverlay>
      <WaitIcon />
      <div>Loading...</div>
    </StyledGridOverlay>
  );
}

function NoRows() {
  return (
    <StyledGridOverlay>
      <div>No Rows</div>
    </StyledGridOverlay>
  );
}