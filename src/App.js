import React, { useEffect } from 'react';
import {observer} from 'mobx-react-lite'
import {store} from './modules/store.js'
import {init} from './helpers/init'
import {Menu} from './components/menu'
import {Loading} from './components/loading'
import {Home} from './views/home'
import {Pins} from './views/pins'
import {Firmwares} from './views/firmwares'
import {Global} from './views/global'
import { fillVoices } from './helpers/makeDefaultStores.js';

const INIT = 1

const App = () => {
    useEffect(()=>{
        if(INIT){
            init()
        } else {
            (async () => {
                // await init()
                // fillVoices()
            })()
        }
    },[])
    return(
        <div style={container}>
            <Loading/>
            <Menu/>
            {views[store.view]}
        </div>
    )
}

const views = {
    home : <Home/>,
    pins : <Pins/>,
    firmware : <Firmwares/>,
    global : <Global/>
}

const container = {
    position:'fixed',
    top:0,left:0,right:0,bottom:0,
    // width:window.innerWidth,
    // height:window.innerHeight,
    padding:0,
    margin:0,
    border:'none',
    backgroundColor:store.theme.backgroundColor
}

export default observer(App)