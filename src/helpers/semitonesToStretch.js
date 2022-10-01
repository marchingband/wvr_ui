export const semitonesToStretch = pitch => {
    const semitone_ratio = Math.pow(2,1/12)
    return Math.pow(semitone_ratio, -pitch)
}