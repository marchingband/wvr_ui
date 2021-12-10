export const numberSort = (a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  } 