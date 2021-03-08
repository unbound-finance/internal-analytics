export const dynamicsort = (property, order) => {
  let sortOrder = 1
  if (order === 'desc') {
    sortOrder = -1
  }
  return function (a, b) {
    // a should come before b in the sorted order
    if (a[property] < b[property]) {
      return -1 * sortOrder
      // a should come after b in the sorted order
    } else if (a[property] > b[property]) {
      return 1 * sortOrder
      // a and b are the same
    } else {
      return 0 * sortOrder
    }
  }
}

export function nFormatter(num, digits) {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
}
