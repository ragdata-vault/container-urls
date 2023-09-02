const express = require('express')
const addresses = require('./container-addresses')

require('dotenv').load()

const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'pug')
app.set('views', './src/views')

app.get('/', (req, res) => {
  addresses()
    .then(list => res.render('list', { list }))
    .catch((err) => {
      throw new Error(err)
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
