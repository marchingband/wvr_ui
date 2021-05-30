const noteNames = {
    0:'C',
    1:'C#',
    2:'D',
    3:'D#',
    4:'E',
    5:'F',
    6:'F#',
    7:'G',
    8:'G#',
    9:'A',
    10:'A#',
    11:'B',
}

export const noteToName = x => noteNames[x%12]
export const noteToOctave = x => Math.floor(x/12) -1