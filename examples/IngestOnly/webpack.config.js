const path = require('path')
module.exports = {
  entry: 'index.js',
  mode: 'production',
  target: 'webworker',
  optimization: {
    minimize: true
  },
  performance: {
    hints: false
  },
  output: {
    path: path.join(__dirname, '/dist'),
    publicPath: 'dist',
    filename: 'worker.js'
  }
}

