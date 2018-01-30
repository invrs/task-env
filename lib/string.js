export function camelCase(str) {
  return str
    .toLowerCase()
    .replace(/[.-](.)/g, function(match, group1) {
      return group1.toUpperCase()
    })
}

export function dotCase(str) {
  return str.replace(/([a-z])([A-Z])/g, function(
    match,
    group1,
    group2
  ) {
    return `${group1}.${group2.toLowerCase()}`
  })
}
