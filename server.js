import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import env from "dotenv"
import cors from "cors"
import bcrypt from "bcrypt"


const app = express();
const port = 3000;
const saltRounds = 10;

env.config();
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
})
db.connect();


app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());


app.post("/register", async(req, res)=>{
    const {username, password, role} = req.body;
    
    
    try{
        
        const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [username])

        if(checkResult.rows.length > 0){
            res.json({error: "Email already exists. Try logging in."})
        }else{
            if (password.length < 8) {

                res.json({error: "your password is too short"})
            }else{

                bcrypt.hash(password, saltRounds, async(err, hash)=>{

                    if(err){
                        res.json("Error hasing password:", err)
                    } else{
                        const response = await db.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", [username, hash, role])
                        res.json("done creating your account")
                    }
                })
            }
            
        }
    

    }catch(err){
        res.json({error: err.message })
    }
})

app.listen(port, ()=>{
    console.log(`now listening in port :${port} http://localhost:${port}`)
})