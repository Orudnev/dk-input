import React, { useEffect, useState } from 'react';
import { IJCommonRow, StatusEnum } from '../../common-types';
import { GridRowModesModel,  GridRenderCellParams } from "@mui/x-data-grid";

declare module '@mui/x-data-grid' {
    interface ToolbarPropsOverrides {
        setRows: (newRows: (oldRows: IJCommonRow[]) => IJCommonRow[]) => void;
        setRowModesModel: (
            newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
        ) => void;
    }
}


export const RenderByStatus = (params: GridRenderCellParams<any, any, any>) => {
    if (params.value == null) {
        return '';
    }
    let status: number = params.row.Status as number;
    let st = { opacity: 1 }
    if (status > StatusEnum.NotProcessed) {
        st = { opacity: 0.5 }
    }
    return (
        <div style={st}>{params.formattedValue}</div>
    );
}