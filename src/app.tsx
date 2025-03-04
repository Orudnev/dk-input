import React, { useEffect, useState } from 'react';
import { GetAllRows } from './web-api-wrapper';
import { IApiResponse, IJCommonRow,  TableNameEnum } from './common-types';
import { GridColDef,GridActionsCellItem, GridRowId, GridRowModesModel, GridRowModes } from "@mui/x-data-grid";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { DataGrid } from '@mui/x-data-grid';

function App() {
  const [InitialRows, setInitialRows] = useState<IJCommonRow[]>([]);
  const [CurrentRows, setCurrentRows] = useState<IJCommonRow[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  useEffect(() => {
    GetAllRows(TableNameEnum.JCommon)
      .then((resp: any) => {
        return resp.data;
      })
      .then((data: IApiResponse) => {
        setInitialRows(data.invokeMethodResult);
        setCurrentRows(data.invokeMethodResult);
      })
      .catch(err => {
        let s = 1;
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

    //const editedRow = CurrentRows.find((row) => row.Id === id);
    setCurrentRows(InitialRows.filter((row) => row.Id !== id));
  };
  const handleDeleteClick = (id: GridRowId) => () => {
    setCurrentRows(CurrentRows.filter((row) => row.Id !== id));
  };

  const JCommonColumns: GridColDef<IJCommonRow>[] = [
    { field: "DestTable", headerName: "Dest", width: 120 },
    { field: "Date", headerName: "Date", width: 120 },
    { field: "DCItem", headerName: "DCItem", width: 140 },
    { field: "Description", headerName: "Description", width: 200, editable: true },
    { field: "Dest", headerName: "Dest", width: 120 },
    { field: "Sum", headerName: "Sum", width: 120 },
    {
      field: 'actions', type: 'actions', headerName: 'Actions', width: 100, cellClassName: 'actions', getActions: (params: any) => {
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
    }
  ];

  return (
    <div>
      <DataGrid getRowId={(row) => row.Id} 
        rows={CurrentRows} 
        columns={JCommonColumns} 
        editMode="row"
        rowModesModel={rowModesModel}
        />
    </div>
  );
}

export default App;
