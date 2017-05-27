const isPord = process.env.END === 'production' ? true : false;
console.log('PROD: ', isPord);
const d = (dev, prod) => {
  if (isPord) {
    return prod;
  }
  return dev;
}

module.exports = {
  host: d('localhost', 'ec2-54-154-31-253.eu-west-1.compute.amazonaws.com'),
  socketPort: d(9999, 9999),
  port: d(800, 800),
  api: d(
    'https://mpnzwe6g7c.execute-api.eu-west-1.amazonaws.com/dev',
    'https://mpnzwe6g7c.execute-api.eu-west-1.amazonaws.com/dev'
  )
}
