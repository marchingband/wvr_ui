import React from 'react';
import { store } from '../modules/store';
import {observer} from 'mobx-react-lite'
import { Text } from './text.js'

// const mkrPinMap = [13,12,11,10,9,8,7,6,5,4,3,2,1,0]
const mkrPinMap = Array(14).fill().map((_,i)=>i).reverse()
const mkrPinLables = Array(14).fill().map((_,i)=>i+1)

export const MKR = observer(() => {
    const pinSelected = store.pinConfigSelected
    return(
        <div>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Text medium primary>
                    MAKER'S BOARD
                </Text>
            </div>

            {/* BOARD */}
            <div 
                style={{
                    width:500,height:300,margin:'auto',display:'flex',marginTop:20,
                    flexDirection:'column',backgroundColor:'#303030',color:store.theme.primary
                }}
            >

                {/* LOGO */}
                <div 
                    style={{
                        width:100,height:60,display:'flex',alignItems:'center',justifyContent:'center',
                        backgroundColor:store.theme.primary,color:'black',fontSize:40,fontFamily:'sans-serif',
                        fontWeight:100,transform:['rotate(90deg) translateX(50px)'],marginRight:'auto',
                    }}
                >
                    WVR
                </div>

                {/* PINS */}
                <div style={{display:'flex',width:'100%',marginBottom:5,marginTop:'auto',flexDirection:'row'}}>
                    {
                        mkrPinLables.map((label,i)=>
                            <div style={{display:'flex',flexDirection:'column',alignItems:'center'}} key={i}>
                                {label}
                                <div 
                                    style={{
                                        width:15,height:15,margin:10,
                                        borderRadius:8,cursor:'pointer',
                                        backgroundColor:
                                                mkrPinMap[i]==pinSelected?
                                                    store.theme.tertiary:
                                                    store.theme.primary
                                }}
                                    onClick={()=>store.pinConfigSelected = mkrPinMap[i] }
                                />
                                <div 
                                    style={{
                                        width:15,height:15,margin:0,
                                        borderRadius:8,cursor:'pointer',
                                        backgroundColor:
                                                mkrPinMap[i]==pinSelected?
                                                    store.theme.tertiary:
                                                    store.theme.primary
                                }}
                                    onClick={()=>store.pinConfigSelected = mkrPinMap[i] }
                                />
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
})
