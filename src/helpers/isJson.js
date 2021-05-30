export const isJson = x => {
    try{
        JSON.parse(x)
    } catch (e) {
        return false
    }
    return true
}
