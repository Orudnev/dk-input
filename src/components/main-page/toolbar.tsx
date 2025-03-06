import React, { useEffect, useState } from 'react';
import { GridRowModes, GridSlotProps, GridToolbarContainer } from "@mui/x-data-grid";
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { StatusEnum } from '../../common-types';
import { GeneratePseudoUniqueId } from '../../web-api-wrapper';

export function EditToolbar(props: GridSlotProps['toolbar']) {
    const { setRows, setRowModesModel } = props;
    const newRowId = GeneratePseudoUniqueId();
    const handleClick = () => {
      setRows((oldRows:any) => [
        ...oldRows,
        { Id:newRowId,Date:new Date(),DCItem:"",Description:"",Dest:"",Sum:0,Sign:-1,AddRowTime:new Date(),Status:StatusEnum.New }
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