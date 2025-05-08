import React, { useEffect, useState } from 'react';
import { ITotals } from '../../common-types';
import { WaitIcon } from './toolbar';

function TotalItem(props: { label: string, value: number }): JSX.Element {
    return (
        <div className='totals-item'>
            <div className='totals-item_label'>{props.label}:</div>
            <div className='totals-item_value'>{props.value}</div>
        </div>
    )
}

function isLoading(props: ITotals): boolean {
    return props.BnBish === -1 && props.BnSok === -1 && props.BnMb === -1 && props.Nal === -1;
}

export function Totals(props: ITotals) {
    if (isLoading(props)) return <div className='totals'><WaitIcon /></div>;
    return (
        <div className='totals'>
            <TotalItem label="BnBish" value={props.BnBish} />
            <TotalItem label="BnSok" value={props.BnSok} />
            <TotalItem label="BnMb" value={props.BnMb} />
            <TotalItem label="Nal" value={props.Nal} />
        </div>
    )
}