import React, { useEffect, useState } from 'react';
import { StatusEnum } from '../../common-types';
import { GridRenderCellParams } from "@mui/x-data-grid";


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