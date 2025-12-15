import express from "express"
import router from "./routes/v1/all"
import cors from "cors"

const app = express()
app.use(cors());

app.use('/api/v1', router)

export default app