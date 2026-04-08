import axios from "axios";
import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from "express-rate-limit";
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', async(req,res)=>{
    res.send('Server running successfully')
})

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 requests per minute
});

app.use(limiter);

app.post('/ask', async(req,res)=>{
    try {
        console.log("BODY:", req.body)
        const {videoId, question} = req.body
        const response = await axios.post('http://127.0.0.1:8000/ask', {
            video_id : videoId, question : question
        })
        res.json(response.data)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Something went wrong" });
    }
})

app.listen(5000, ()=>{
    console.log("Server running on http://localhost:5000")
})