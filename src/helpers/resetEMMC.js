

export const resetEMMC = async() =>{
    const response = await fetch('http://192.168.5.18/emmcReset', {
        method: 'get',
    });
    alert("eMMC on WVR has been reset, please refresh the browser")
}