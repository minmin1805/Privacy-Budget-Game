import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
import playerRoutes from './routes/playerRoutes.js';

dotenv.config();

const app = express();

const __dirname = path.resolve();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ['Content-Type', 'Authorization'],

}));

app.use(express.json());

//API routes
app.use("/api/players", playerRoutes);

const PORT = process.env.PORT || 8000;

if(process.env.NODE_ENV === 'production'){
    const distPath = path.join(__dirname, 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    })
}


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});

export default app;
