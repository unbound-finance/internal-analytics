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
