const express = require('express')
const app = express()
const port = 8080

app.get('/', (req, res) => {
    res.send("Hello world!")
})

app.get('/:name', (req, res) => {
    res.send("Hello "+req.params.name+" !!!")
})

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})