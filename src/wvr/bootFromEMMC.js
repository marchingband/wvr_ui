import {initStore} from '../helpers/init'

export const bootFromEMMC = async num => {
    console.log("booting from EMMC slot " + num)
    let res = await fetch(
        "/bootFromEmmc",
        // "http://192.168.4.1/bootFromEmmc",
        {
            method: "GET",
            headers: {
                "index":num
            }
        }
    )
    .catch(e=>console.log(e))
    console.log("done booting from EMMC slot " + num)
    await initStore()
}
