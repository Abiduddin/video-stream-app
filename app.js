const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()
const port = 3000

let totalBytesSent = 0

app.use((req, res, next) => {

    let bytesSent = 0

    const originalWrite = res.write
    const originalEnd = res.end

    res.write = function(chunk, encoding, callback) {
        if(chunk){
            bytesSent += Buffer.byteLength(chunk, encoding)
        }
        return originalWrite.call(res, chunk, encoding, callback)
    }

    res.end = function (chunk, encoding, callback) {
        if(chunk){
            bytesSent += Buffer.byteLength(chunk, encoding)
        }
        totalBytesSent += bytesSent
        console.log(`##### Bytes sent for this request : ${bytesSent}`)
        console.log(`##### Total Bytes sent for this request : ${totalBytesSent}`)
        return originalEnd.call(res, chunk, encoding, callback)
    }

    console.log("### pass the request to next ###")

    next();

})


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/name/:name', (req, res) => {
    res.send("Hello " + req.params.name + " !!!")
})

app.get('/video', (req, res) => {
    // add the video file here
    const videoFilePath = path.join(__dirname, 'myvideo.mp4')
    const stat = fs.statSync(videoFilePath)
    const fileSize = stat.size
    console.log("file size: " + fileSize)
    const range = req.headers.range
    console.log("request headers range: " + range)


    if (range) {
        console.log("video range wise")
        const parts = range.replace(/bytes=/, '').split('-')
        console.log("video parts : " + parts)

        const start = parseInt(parts[0], 10)
        console.log("video start : " + start)

        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        console.log("video end : " + end)


        if (start >= fileSize) {
            res.status(416).send('Requested range out of bound')
            return
        }

        const chunkSize = (end - start) + 1
        console.log("video chunkSize : " + chunkSize)

        const file = fs.createReadStream(videoFilePath, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        }
        console.log("video head Content-Range : " + head['Content-Range'])


        res.writeHead(206, head)
        file.pipe(res)
    } else {
        console.log("video at a time")
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4'
        }
        res.writeHead(200, head)
        const file = fs.createReadStream(videoFilePath)
        file.pipe(res)
    }

})

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})