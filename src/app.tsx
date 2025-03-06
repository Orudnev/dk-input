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
import { MainPage } from './components/main-page/page';

function App() {
  return (
    <MainPage />
  );
}




export default App;
