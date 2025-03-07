import React, { useEffect, useState } from 'react';
import { GridRowModes, GridRowSelectionModel, GridSlotProps, GridToolbarContainer } from "@mui/x-data-grid";
import AddIcon from '@mui/icons-material/Add';
import { CheckBoxOutlineBlankOutlined, CheckBoxOutlined, DeleteOutlineOutlined, DnsTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GeneratePseudoUniqueId } from '../../web-api-wrapper';
import { GridRowModesModel, GridRenderCellParams } from "@mui/x-data-grid";
import { IJCommonRow, StatusEnum } from '../../common-types';

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
    }
    props.setIsSelectRowsMode(newValue);
  };
  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleAddClick}>
        Add
      </Button>
      {props.isSelectRowsMode ?
        <Button color="primary" startIcon={<CheckBoxOutlined />} onClick={() => handleSelectClick(false)}>
          Select
        </Button> :
        <Button color="primary" startIcon={<CheckBoxOutlineBlankOutlined />} onClick={() => handleSelectClick(true)}>
          Select
        </Button>
      }
      {props.rowSelectionModel.length > 0 &&
        <Button color="primary" startIcon={<DeleteOutlineOutlined />} onClick={() => props.handleToolbarCmd("Delete")}>
          Delete
        </Button>
      }
      {props.rowSelectionModel.length > 0 &&
        <Button color="primary" startIcon={<DnsTwoTone />} onClick={() => props.handleToolbarCmd("ToLookup")}>
          To Lookup
        </Button>
      }

    </GridToolbarContainer>
  );
}

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: IJCommonRow[]) => IJCommonRow[]) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
    isSelectRowsMode: boolean;
    setIsSelectRowsMode: (value: boolean) => void;
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