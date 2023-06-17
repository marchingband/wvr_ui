import { store } from "../modules/store"
import axios from 'axios'

export const fetchLocalIP = async() => {
    const ret = await axios.get(
        "/fetchLocalIP",
        {
            headers:{
                'Content-Type': 'text/plain',
            }
        }
    )
    .catch(e=>console.log(e))
    store.localIP = ret.data
}

export const joinLocalNetwork = async() => {
    const ret = await axios.get(
        "/tryLogonLocalNetwork",
        {
            headers:{
                'Content-Type': 'text/plain',
                "ssid" : store.metadata.stationWifiNetworkName,
                "password" : store.metadata.stationWifiNetworkPassword 
            }
        }
    )
    .catch(e=>console.log(e))
    console.log(ret)
    // store.localIP = ret.data
}