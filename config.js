const isPord = process.env.END === 'production' ? true : false;
const d = (dev, prod) => {
  if (isPord) {
    return prod;
  }
  return dev;
}

module.exports = {
  host: d('localhost', '54.154.31.253'),
  socketPort: d(9999, 9999),
  port: d(800, 800),
  api: d(
    'https://mpnzwe6g7c.execute-api.eu-west-1.amazonaws.com/dev',
    'https://mpnzwe6g7c.execute-api.eu-west-1.amazonaws.com/dev'
  )
}
