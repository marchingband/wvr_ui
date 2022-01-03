import React, { useEffect } from 'react';
import {observer} from 'mobx-react-lite'
import {store} from './modules/store.js'
import {init} from './wvr/init'
import {Menu} from './components/menu'
import {Loading} from './components/loading'
import {Home} from './views/home'
import {Pins} from './views/pins'
import {Firmwares} from './views/firmwares'
import {Global} from './views/global'

const INIT = 1

const App = () => {
    useEffect(()=>{
        INIT && init()
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
    padding:0,
    margin:0,
    border:'none',
    backgroundColor:store.theme.backgroundColor,
    overflow:'scroll',
    minWidth:750
}

export default observer(App)