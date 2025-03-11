import React, { useEffect, useState } from 'react';
import { GridRowModes, GridRowSelectionModel, GridSlotProps, GridToolbarContainer } from "@mui/x-data-grid";
import AddIcon from '@mui/icons-material/Add';
import { CheckBoxOutlineBlankOutlined, CheckBoxOutlined, DeleteOutlineOutlined, DnsTwoTone, CancelTwoTone, SaveTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GeneratePseudoUniqueId } from '../../web-api-wrapper';
import { GridRowModesModel, GridRenderCellParams } from "@mui/x-data-grid";
import { IJCommonRow, StatusEnum } from '../../common-types';
import { MainPageMode } from './page';

export function EditToolbar(props: GridSlotProps['toolbar']) {
  const { setRows, setRowModesModel } = props;
  const newRowId = GeneratePseudoUniqueId();
  const handleAddClick = () => {
    setRows((oldRows: any) => [
      ...oldRows,
      { Id: newRowId, Date: new Date(), DCItem: "", Description: "", Dest: "", Sum: 0, Sign: -1, AddRowTime: new Date(), Status: StatusEnum.New }
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [newRowId]: { mode: GridRowModes.Edit, fieldToFocus: 'Description' },
    }));
  };

  const handleSelectClick = (newValue: boolean) => {
    if (newValue === false) {
      props.setRowSelectionModel([]);
      props.setMainPageMode(MainPageMode.Regular);
    } else {
      props.setMainPageMode(MainPageMode.SelectRows);
    }
  };

  const addBtn = props.mainPageMode === MainPageMode.Regular && <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>Add</Button>;
  const addSmartBtn = props.mainPageMode === MainPageMode.Regular && <Button color="primary" startIcon={<AddIcon />} onClick={() => props.handleToolbarCmd("SmartAdd")}>Smart Add</Button>;
  const selectBtn = props.mainPageMode === MainPageMode.SelectRows 
                    ?  <Button color="primary" startIcon={<CheckBoxOutlined />} onClick={() => handleSelectClick(false)}>
                            Select
                        </Button>
                    :  props.mainPageMode === MainPageMode.Regular 
                          ? <Button color="primary" startIcon={<CheckBoxOutlineBlankOutlined />} onClick={() => handleSelectClick(true)}>
                              Select
                            </Button>
                          : null;
  const deleteBtn = props.rowSelectionModel.length > 0 && <Button color="primary" startIcon={<DeleteOutlineOutlined />} onClick={() => props.handleToolbarCmd("Delete")}>Delete</Button>; 
  const toLookupBtn = props.rowSelectionModel.length > 0 && <Button color="primary" startIcon={<DnsTwoTone />} onClick={() => props.handleToolbarCmd("ToLookup")}>To Lookup</Button>;
  const cancelBtn = props.mainPageMode === MainPageMode.SmartAddRow && <Button color="primary" startIcon={<CancelTwoTone />} onClick={() => props.handleToolbarCmd("Cancel")}>Cancel</Button>;
  const saveBtn = props.mainPageMode === MainPageMode.SmartAddRow && <Button color="primary" startIcon={<SaveTwoTone />} onClick={() => props.handleToolbarCmd("Save")}>Save</Button>;
  return (
    <GridToolbarContainer>
      {addBtn}      
      {addSmartBtn}
      {selectBtn}      
      {deleteBtn}
      {toLookupBtn}
      {cancelBtn}
      {saveBtn}
    </GridToolbarContainer>
  );
}

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: IJCommonRow[]) => IJCommonRow[]) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
    mainPageMode: MainPageMode;
    setMainPageMode: (value: MainPageMode) => void;
    rowSelectionModel: GridRowSelectionModel;
    setRowSelectionModel: (value: GridRowSelectionModel) => void;
    handleToolbarCmd: (cmd: string) => void;
  }
}

export function WaitIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="#4A90E2" strokeWidth="4" fill="none" stroke-linecap="round"
        stroke-dasharray="126.92" stroke-dashoffset="0">
        <animate attributeName="stroke-dashoffset" from="0" to="-126.92" dur="1s" repeatCount="indefinite" />
        <animate attributeName="stroke" values="#4A90E2;#50E3C2;#4A90E2" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}  