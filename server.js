import express from "express";
import bodyParser from "body-parser";
import pg from "pg"
import env from "dotenv"
import cors from "cors"
import bcrypt from "bcrypt"
import session from "express-session";
import passport from "passport";
import {Strategy} from "passport-local"


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

app.use(session({
  secret: "IMPORTEXPRESSFROMEXPRESS",
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge :1000 * 60 * 60 * 24},
}));
app.use(passport.initialize());
app.use(passport.session());


app/

app.post("/admin/register", async(req, res)=>{
    const {username, password, role} = req.body;
    
    
    try{
        
        const checkResult = await db.query("SELECT * FROM users WHERE username = $1", [username])

        if(checkResult.rows.length > 0){
            res.json({error: "Username already exists. Try logging in."})
        }else{
            if (password.length < 8) {

                res.json({error: "your password is too short"})
            }else{

                bcrypt.hash(password, saltRounds, async(err, hash)=>{
 
                    if(err){
                        res.json("Error hasing password:", err)
                    } else{
                        const response = await db.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", [username, hash, role])
                        res.json({success: true, message: "Account created"})
                    }
                })
            }
            
        }
    

    }catch(err){
        res.json({error: err.message })
    }
});


app.post("/login", passport.authenticate('local'), (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get("/dashboard", (req, res)=>{
    if(req.isAuthenticated()){
        res.json({ authenticated: true})
    }else{
        res.json({ authenticated: false})
    }
});

passport.use(new Strategy(async function verify(username, password, cb){
    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [
          username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashPassword = user.password;
    
          bcrypt.compare(password, storedHashPassword, (err, result)=> {
            if(err){
              console.log("Error comparing passwords:", err);
            }else {
              if(result){
                return cb(null, user)
              }else{
                return cb(null, false)
              }
            };
          });
        } else {
          return cb("User not found");
        };
      } catch (err) {
        return cb(err);
      };
}))

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Logged out successfully" });
    });
});

passport.serializeUser((user, cb) =>{
  cb(null, user);
});

passport.deserializeUser((user, cb) =>{
  cb(null, user);
});

app.listen(port, ()=>{
    console.log(`now listening in port :${port} http://localhost:${port}`)
})