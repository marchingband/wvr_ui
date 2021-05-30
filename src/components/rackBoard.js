import React from 'react';
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {RackBoardItem} from '../components/rackBoardItem'
import ArrowRight from '../svg/arrow.svg';

export const RackBoard = observer(()=>{  
    const {num_layers=0} = store.getCurrentNote().rack || {}
    return(
    <div style={container}>
        <RackBoardButton left/>
        {
            Array(Math.min(store.numWavPerPage,num_layers)).fill()
            .map((_,i)=>
                <RackBoardItem
                    key={i}
                    i={store.rackBoardIndex + i}
                />
            )
        }
        <RackBoardButton right/>
    </div>
)})

const RackBoardButton = props => 
    <div 
        style={button} 
        onClick={()=>store.scrollRackBoard(props.right)}
    >
        <img 
            height={25}
            src={ArrowRight}
            style={{
                transform:props.right?[]:['rotate(180deg)'],
                userSelect:'none'
            }}
        />
    </div>

const button = {
    width:50,
    height:50,
    borderRadius:26,
    border:`2px solid ${store.theme.secondary}`,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    cursor:'pointer',
    margin:10,
}

const container = {
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center',
}