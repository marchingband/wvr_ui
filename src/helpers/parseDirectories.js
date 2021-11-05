

// add directory="" webkitdirectory="" to <file/> tag

export const parseDirectories = e => {
    let numFiles = e.target.files.length
    let files = []
    for(let i=0;i<numFiles;i++){
        files.push(e.target.files[i])
    }
    let bad = files.filter(x=>x.webkitRelativePath.split("/").length != 3)
    files = files.filter(x=>x.webkitRelativePath.split("/").length == 3)
    if(bad.length){
        window.alert(`removed ${bad.map(x=>x.webkitRelativePath)}`)
    }
    // if(files.every(x=>x.webkitRelativePath.split("/").length == 3)){
    // } else {
    //     window.alert("error :please select a folder of files (for notes), or a filder of folders of files (for racks)")
    //     return false
    // }
    return parseAsRacks(files)
}

const parseAsRacks = files => {
    let tree = {}
    for(let file of files){
        let path = file.webkitRelativePath.split("/")
        let [root, dir, name] = path
        if(!tree[dir]){
            tree[dir] = []
        }
        tree[dir].push(file)
    }
    return tree
}