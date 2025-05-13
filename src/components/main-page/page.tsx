import React, { useEffect, useState } from 'react';
import { AddOrUpdateRow, DeleteRows, GetAllRows, GetAllTablesContent, GetTotalsWithJcommon } from '../../web-api-wrapper';
import { IAccountRow, IAllTablesContentDTO, IApiResponse, IAppScriptResponse, IDCItems, IJCommonRow, ITotals, StatusEnum, TableNameEnum } from '../../common-types';
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
import { useStore, useSelector } from 'react-redux'
import { IAppSettings } from '../../Reducers/app';

export enum MainPageMode {
  Regular,
  SelectRows,
  SmartAddRow
}

function convertArrayToJCommonRows(rows: any[]): IJCommonRow[] {
  let result: IJCommonRow[] = [];
  rows.forEach((row) => {
    let newRow: IJCommonRow = {
      Id: row[0],
      DestTable: row[1],
      Date: new Date(row[2]),
      DCItem: row[3],
      Description: row[4],
      Dest: row[5],
      Sum: row[6],
      Sign: row[7],
      AddRowTime: new Date(row[8]),
      Status: row[9]
    };
    result.push(newRow);
  });
  return result;
}

function convertArrayToAccountRows(rows: any[]): IAccountRow[] {
  let result: IAccountRow[] = [];
  rows.forEach((row) => {
    let newRow: IAccountRow = {
      Id: row[0],
      Date: new Date(row[1]),
      DCItem: row[2],
      Dest: row[3],
      Description: row[4],
      Sum: row[5],
      Sign: row[6],
      Total: row[7],
      Status: row[8]
    };
    result.push(newRow);
  });
  return result;
}

function convertArrayToDCItemRows(rows:any[]): IDCItems[] {
  let result: IDCItems[] = [];
  rows.forEach((row) => {
    let newRow: IDCItems = {
      Name: row[0],
      Sign: row[1],
      Dest: row[2]
    };
    result.push(newRow);
  });
  return result;
}

function calculateTotals(currJcRows: IJCommonRow[],allTblContent:IAllTablesContentDTO):ITotals {
  let calcTotals = (rows:IAccountRow[],tableName:string) => {
    let accTotals = rows.reduce((acc, row) => {
        if(row.DCItem == 'Вх.Остаток'){
          return row.Total;
        }
        return acc + row.Sum*row.Sign;  
    },0);
    let jcTotals = currJcRows.filter(row=>row.DestTable==tableName && (row.Status == undefined || row.Status == 0)).reduce((acc, row) => acc + row.Sum*row.Sign,0);
    return accTotals+jcTotals;
  }
  let result:ITotals={
    BnBish:calcTotals(allTblContent.BnBish,"BnBish"),
    BnMb:calcTotals(allTblContent.BnMb,"BnMb"),
    BnSok:calcTotals(allTblContent.BnSok,"BnSok"),
    Nal:calcTotals(allTblContent.Nal,"Nal")
  };
  return result;
}

export function MainPage() {
  const [Rows, setRows] = useState<IJCommonRow[]>([]);
  const undefinedTotals: ITotals = { BnBish: -1, BnSok: -1, BnMb: -1, Nal: -1 };
  const [totalsData, setTotalsData] = useState<ITotals>(undefinedTotals);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  const [LookupRows, setLookuprows] = useState<IJCommonRow[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  //const [DestOptions, setDestOptions] = useState<any[]>([{ Name: "Loading..." }]);
  //const [DCItemOptions, setDCItemOptions] = useState<IDCItems[]>([{ Name: "Loading...", Dest: "", Sign: 0 }]);
  const [waitSave, setWaitSave] = useState<string[]>([]);
  const [mainPageMode, setMainPageMode] = useState<MainPageMode>(MainPageMode.Regular);
  const store = useStore();
  const AllTables = useSelector((state: any) => state.AppReducer.tablesContent);
  const DestRows = useSelector((state: any) => state.AppReducer.tablesContent.Dest);
  const DCItemRows = useSelector((state: any) => state.AppReducer.tablesContent.DCItems);
  const reloadRows = () => {
    setIsLoading(true);
    GetAllTablesContent()
      .then((resp: any) => {
        setIsLoading(false);
        if (!resp.data.isOk) throw new Error(resp.data.error);
        return resp.data.invokeMethodResult;
      })
      .then((data: IAllTablesContentDTO) => {
        let allTblContentDTO: IAllTablesContentDTO = {
          JCommon: convertArrayToJCommonRows(data.JCommon),
          BnBish: convertArrayToAccountRows(data.BnBish), 
          BnSok: convertArrayToAccountRows(data.BnSok),
          BnMb: convertArrayToAccountRows(data.BnMb),
          Nal: convertArrayToAccountRows(data.Nal),
          Dest: (()=>data.Dest.map(itm=>itm[0]))(),
          DCItems: convertArrayToDCItemRows(data.DCItems)
        }
        store.dispatch({ type: 'AllTablesContent', tablesContent: allTblContentDTO });
        setIsLoading(false);
        const regularRows = allTblContentDTO.JCommon.filter((row: IJCommonRow) => row.Status < StatusEnum.Lookup);
        const lrows = allTblContentDTO.JCommon.filter((row: IJCommonRow) => row.Status == StatusEnum.Lookup);
        setRows(regularRows);
        let totals = calculateTotals(regularRows,allTblContentDTO);
        setTotalsData(totals);
        setLookuprows(lrows);
      })
      .catch(err => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    reloadRows();
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
    let totals = calculateTotals(newRows,AllTables);
    setTotalsData(totals);

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
            reloadRows();
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
          reloadRows();
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
    { field: "DCItem", headerName: "DCItem", width: 80, type: "singleSelect", valueOptions: () => { return DCItemRows.map((option:any) => option.Name); }, renderCell: RenderByStatus, editable: true },
    { field: "Description", headerName: "Description", width: 200, renderCell: RenderByStatus, editable: true },
    {
      field: "Dest", headerName: "Dest", width: 80, type: "singleSelect",
      valueOptions: () => {
        return DestRows.map((option: any) => {return {name:option}});
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
    let last_EditedRow = undefined;
    if (Rows.length > 0) {
      last_EditedRow = Rows.reduce((max: any, item: any) => {
        let result = item.AddRowTime > max.AddRowTime ? item : max;
        return result;
      });
    }
    return (
      <div>
        <SmartAddForm lookupRows={LookupRows} dcItemOptions={DCItemRows} destOptions={DestRows.map((itm: any) => { return { Name: itm } })} handleSubmit={(newRow) => {
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
          let totals = calculateTotals(newRows,AllTables);
          setTotalsData(totals);      
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