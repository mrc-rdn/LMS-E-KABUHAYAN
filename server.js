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
const saltRounds = parseInt(process.env.SALTED_ROUNDS);

env.config();
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // your React app's URL
    credentials: true,               // allow cookies to be sent
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true if using https
    sameSite: "lax",
     maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(passport.initialize());
app.use(passport.session());


app.post("/admin/register", async(req, res)=>{
    const {firstName, surname, contactNo, username, password, role } = req.body;   
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
                        const usersRes = await db.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *", [username, hash, role])
                
                        const users = usersRes.rows[0]
                        const userId = users.id
                        
                        const userInfoRes = await db.query("INSERT INTO users_info (id, first_name, surname, contact_no) VALUES ($1, $2, $3, $4) RETURNING *", [userId, firstName, surname, contactNo])
                        
                        res.json({success: true, message: "Account created"})
                    }
                })
            }
        }
    }catch(err){
        res.json({error: err.message })
    }
});



//trainer
//trainer
//trainer

// login trainer side
app.post("/trainer/login", passport.authenticate('local'), (req, res) => {
   
  try {
    if(req.user.role === "TRAINER"){
      res.json({success: true, redirectTo: "/trainer/dashboard"})
    } else{
      res.json({success: false, message: "role is invalid"})
    }
  } catch (error) {
    console.log(error)
  }
});


// this will get all the data in your crediatials after you login 
app.get("/trainer/dashboard", async(req, res)=>{
    
    try{
      if(req.isAuthenticated()){
        if(req.user.role === "TRAINER"){
          const response = await db.query("SELECT * FROM users JOIN users_info ON users.id = users_info.id WHERE username = $1",[req.user.username])
          const TRAINEEcount = await db.query("SELECT * FROM users WHERE role = $1", ['TRAINEE'])
          const totalTrainee = TRAINEEcount.rows
          
          res.json({success: true, user: response.rows[0], totalTrainee: totalTrainee.length})
        }else{
          return res.json({success: false , message: 'role is invalid'})
        }
        
      }else{
        res.json({success: false})
      }
    }catch(err){
      res.status(400).json({message: err})
    }
   
        
       
});

//log out trainer side
app.post("/trainer/dashboard/logout", (req, res, next) => {

  if (!req.isAuthenticated()) {
    return res.status(400).json({ message: "No active session found" });
  }

  req.logout( (err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to destroy session" });

      res.clearCookie("connect.sid");
      return(res.json({ message: "Successfully logged out", redirectTo: "/" }));
    });
  });
});

app.get("/trainer/dashboard/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Logged out successfully" });
    });
});



//trainee
//trainee
//trainee

//login for trainee
app.post("/trainee/login",passport.authenticate('local'), (req, res)=>{
  try {
    if(req.user.role === "TRAINEE"){
      res.json({success: true, redirectTo: "/trainee/dashboard"})
    } else{
      res.json({success: false, message: "role is invalid"})
    }
  } catch (error) {
    console.log(error)
  }
  
})


// //getting a certain data of users
app.get("/trainee/dashboard", async(req, res)=>{
  
    try{
      if(req.isAuthenticated()){
        if(req.user.role === "TRAINEE"){
          const response = await db.query("SELECT * FROM users JOIN users_info ON users.id = users_info.id WHERE username = $1",[req.user.username])

          res.json({success: true, user: req.user, data: response.rows})
        }else{
          return res.json({success: false , message: 'role is invalid'})
        }
        
      }else{
        res.json({success: false})
      }
    }catch(err){
      res.status(400).json({message: err})
    }
})

app.post("/trainee/dashboard/logout", (req, res, next) => {

  if (!req.isAuthenticated()) {
    return res.status(400).json({ message: "No active session found" });
  }

  req.logout( (err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to destroy session" });

      res.clearCookie("connect.sid");
      return(res.json({ message: "Successfully logged out", redirectTo: "/" }));
    });
  });
});

app.get("/trainee/dashboard/logout", (req, res) => {
    req.logout(function(err) {
        if (err) {
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Logged out successfully" });
    });
});



//ADMIN
//ADMIN
//ADMIN




passport.use(new Strategy(async function verify(username, password, cb){
    try {
      const result = await db.query("SELECT * FROM users WHERE username = $1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        
    
        bcrypt.compare(password, user.password, (err, result)=> {
          if(err){
            console.log("Error comparing passwords:", err);
          }else {
            if(result){
              return cb(null, user)
            }else{
              return cb(null, false, {message: "Incorrect Password"}) 
              
            }
          };
        });
      } else {
        return cb("User not found");
      };
    }catch (err) {
      return cb("error handling", err);
    };
}))



passport.serializeUser((user, cb) =>{
  cb(null, user);
  
});

passport.deserializeUser((user, cb) =>{
  cb(null, user)
  
});

app.listen(port, ()=>{
    console.log(`now listening in port :${port} http://localhost:${port}`)
})