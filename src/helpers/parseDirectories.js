

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
        if(!file.name.startsWith(".")){ // remove hidden files
            if(tree[dir].length >= 32){ // max 32 slots per rack
                continue
            }
            tree[dir].push(file)
        }
    }
    return tree
}