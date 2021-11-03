const express = require('express')
const app = express()
const axios = require("axios")
const Redis = require("redis")
const redisClient = Redis.createClient();

const DEFAULT_EXPIRATION = 3600;
 
app.get('/photos', async (req, res) => {
    const startTime = new Date().getTime();

    const albumId = req.query.albumId;
    const photos = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
        const { data } = await axios.get(
            "https://jsonplaceholder.typicode.com/photos",
            { params: {albumId} }
        )
        return data;
    })
    console.log("time request: ", new Date().getTime() - startTime);
    res.json(photos);
})

app.get('/photos/:id', async (req, res) => {
    const startTime = new Date().getTime();
    const photo = await getOrSetCache(`photo/${req.params.id}`, async () => {
        const { data } = await axios.get(
            `https://jsonplaceholder.typicode.com/photos/${req.params.id}`,
        )
        return data;
    })
    console.log("time request: ", new Date().getTime() - startTime);
    res.json(photo);
})

function getOrSetCache(key, cb) {
    return new Promise((resolve, reject) => {
        redisClient.get(key,  async (error, data) => {
            if(error) return reject(error);
            if (data != null) return resolve(JSON.parse(data));
            freshData = await cb()
            redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
            return resolve(freshData);
        })
    })
}

 
app.listen(3000, () => {
    console.log("Runing with port 3000")
})