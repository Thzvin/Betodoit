require("dotenv").config()
const express = require("express");
const cors = require("cors")
const app = express();
const pool = require("./db")
const bcrypt = require("bcrypt");
const session = require("express-session");

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  proxy: true, 
  cookie: {
    secure: process.env.NODE_ENV === "production", 
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}))

app.use(cors({
  origin: true,
  credentials: true
}))


const isLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "belum login"
    })
  }
  next()
}


app.use(express.json());


// login post
app.post("/login", async (req , res) => {

  const {username , password} = req.body

    const cek = await pool.query(
      "SELECT id , username ,password FROM account WHERE username = $1",
      [username]  
    )

    if(cek.rows.length === 0){
      return res.json({
        success : false,
        message : "username atau password salah"
      })

    }


    const match = await bcrypt.compare(password , cek.rows[0].password)

    if(!match){
      return res.status(401).json({
        success : false,
        message : "username atau password salah"
      })

    }
    
      req.session.user = {
            id : cek.rows[0].id,
            username : cek.rows[0].username
      }


    res.json({
      success : true,
      message : "berhasil login"
      
    })

})

// register post
app.post("/register" , async (req , res) => {
 
  const {username ,password } = req.body


  const cek = await pool.query(
    "SELECT username FROM account WHERE username = $1",
    [username]
  )
 
  if(cek.rows.length){
   return res.json({
      message : "username sudah ada",
      hasil : false 
    })
  }

  const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO account (username, password) VALUES ($1 , $2 ) RETURNING id,  username" ,
      [username ,hashedPassword]
    )
  
    if(result){
      res.json({
        message :"berhasil register",
        hasil : true
      })
    }
  
})

//todolist post 
app.post("/todolist" , isLogin,  async(req , res )=> {

  const {title , description} = req.body
  const accountid = req.session.user.id


  if(title.length > 50){
    return res.status(400).json({
      message : "judul terlalu panjang"
    })
  }
   
   let newText = ""
   for(let i = 0 ; i < title.length ; i++){
      if(i === 0){
        newText += title[i].toUpperCase()
      }else{
        newText += title[i]
      }
   }
  
   try{
      await pool.query(
        `INSERT INTO todolist (account_id, title , description) 
        VALUES
        ($1 , $2 , $3)
        `,
        [accountid , newText , description]
      )


      res.json({
        message: "berhasil ditambahkan"
      })
   }catch(err){
    res.json({
      message : "gagal menambahkan data"
    })
   }


})


//get todolist
  app.get("/todolist", isLogin , async (req, res) => {

    const id = req.session.user.id
    
    
 
    const hasil = await pool.query(
      "SELECT * FROM account WHERE ID = $1",
      [id]
    )

    if(hasil.rows.length === 0){
      return res.status(401).json({
        success: false
      })
    }
    

    

  
    try{

    
    const datahasil = await pool.query(
      "SELECT id, title , description , status FROM todolist WHERE account_id = $1" ,
      [id]
    )

  
    res.json({
      success: true,
      data : datahasil.rows
    })
  }catch(err){
    console.log(err)
    res.status(401).json({
      success: false
    })
  }
  })


// delete todo 
app.delete("/todolist" , isLogin  , async(req , res) => {
  
    const idaaccount = req.session.user.id
    const body = req.body.index
 try{

     if (Array.isArray(body)) {
      for (const id of body) {
        await pool.query(
          "DELETE FROM todolist WHERE id = $1 AND account_id = $2",
          [id, idaaccount]
        )
      }

      return res.json({
        success: true,
        message: "berhasil hapus checklist"
      })
    }


            await pool.query(
              "DELETE FROM todolist WHERE id = $1 AND account_id = $2",
              [body , idaaccount]
            )
            
          
           return res.json({
              success : true,
              message : "berahasil delete"
            })
              
          }catch(err){
            res.status(500).json({
              success : false,
              message  : "gagal delete"
              })
          }

   

})


app.patch("/todolist" , isLogin, async (req, res) =>  {
    const aksi = req.body.action
    const body = Number(req.body.index)
    const idaaccount = req.session.user.id
   
   try{
await pool.query(
      "UPDATE todolist SET status = $1 WHERE id = $2 AND account_id = $3 ",
      [aksi , body , idaaccount ]
    )

    res.json({
      success : true
    })
  }catch(err){
    console.log(err)
    res.status(401).json({
      success: false,
      message : "gagal mengubah data"
    })
  }
    
    
})

app.post("/logout" , (req , res) => {
   req.session.destroy(err=> {
    if(err) {
      return res.json({
        success: false,
        message: "Logout gagal"
      })
    }else{

         res.json({
      success: true,
      message: "Logout berhasil"
    })
      }
   }
   )
})





app.get("/me", async (req, res) => {
  if (!req.session.user) {
    return res.json({ login: false })
  }

  const id = req.session.user.id

  const result = await pool.query(
    "SELECT username FROM account WHERE id = $1",
    [id]
  )

  if (result.rows.length === 0) {
    return res.status(401).json({ login: false })
  }

  res.json({
    login: true,
    username: result.rows[0].username
  })
})

app.get("/", (req, res) => {
  res.send("Backend is running 🚀")
})



const PORT = process.env.PORT || 8080

app.listen(PORT, "0.0.0.0", () => {
  console.log("server running on port", PORT)
})