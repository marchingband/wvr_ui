import React, { useState, useRef, useEffect } from 'react';
import {observer} from 'mobx-react-lite'
import { store } from '../modules/store';
import {Text} from '../components/text'

export const Loading = observer(() => {
    if(!store.loading){
        return null
    }
    return(
        <div style={container1}>
            <div style={container2}>
                <div style={container3}>
                    <Text large secondary>
                        {store.loadingTitle}
                    </Text>
                    <Text medium secondary>
                        {store.loadProgress > 0 ? `${store.loadProgress}%` : ""}
                    </Text>
                </div>
            </div>
        </div>
    )
})

const container1 = {
    position:'fixed',
    top:0,left:0,right:0,bottom:0,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    zIndex:2,
    opacity:0.7,
    backgroundColor:store.theme.foregroundColor,
}

const container2 = {
    position:'fixed',
    top:0,left:0,right:0,bottom:0,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    zIndex:2,
    opacity:0.7,
    backgroundColor:store.theme.backgroundColor,
}

const container3 = {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    // justifyContent:'center',
    zIndex:3,
    // opacity:0.7,
    // backgroundColor:store.theme.backgroundColor,
    height:300
}