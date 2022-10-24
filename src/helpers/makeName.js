export const makeName = name => name.slice(0,-4).substring(0,19) + name.slice(-4)
export const makeRackName = name => name.slice(0,-4).substring(0,17)
export const path2name = path => {
    if(path.includes("\\")){
        const parts = path.split("\\")
        return parts[parts.length - 1]
    }
    if(path.includes("/")){
        const parts = path.split("/")
        return parts[parts.length - 1]
    }
    return path
}

