import React, { useEffect, useState } from 'react';
import { ITotals } from '../../common-types';

function TotalItem(props:{label:string,value:number}):JSX.Element{
    return(
        <div className='totals_item'>{props.label}:{props.value}</div>
    )
}

export function Totals(props:ITotals){
    return(
        <div className='totals'>
            <TotalItem label="BnBish" value={props.BnBish}/>
            <TotalItem label="BnSok" value={props.BnSok}/>
            <TotalItem label="BnMb" value={props.BnMb}/>
            <TotalItem label="Nal" value={props.Nal}/>            
        </div>
    )
}