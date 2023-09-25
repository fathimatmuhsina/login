if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}


const express=require("express");
const app=express();

const bcryptjs=require('bcryptjs')
const passport=require('passport');
const flash=require('express-flash')
const session=require('express-session')
const methodOverride=require('method-override');
const initializePassport=require('./passport-config');


initializePassport(passport,
  email=>users.find(user =>user.email===email),
  id=>users.find(user=>user.id === id)
)


// const users={
//   email:'muhsi@gmail.com',
//   password:1234
// }
const users=[]

app.use(express.static('public'));
app.set('view-engine','ejs');
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false
}))
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/',checkAuthenticated,(req,res)=>
{
  res.render('index.ejs',{name:req.user.name});
})

app.get('/login',checkNotAuthenticated,(req,res)=>
{
  res.render('login.ejs');
})

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
  successRedirect:'/',
  failureRedirect:'/login',
  failureFlash:true
}))


app.get('/register',checkNotAuthenticated,(req,res)=>
{
  res.render('register.ejs');
})
app.post('/register',checkNotAuthenticated,async (req,res)=>

{

  try{
    const hashedPassword=await bcryptjs.hash(req.body.password,10)
    // console.log(req.body.name)
    users.push({
      id:Date.now().toString(),
      name:req.body.name,
      email:req.body.email,
      password:hashedPassword
    
    })
    res.redirect('/login')
  }
  catch{
    res.redirect('/register')

  }
console.log(users)
 
})
// app.delete('/logout',(req,res)=>{
//   req.logout()
//   res.redirect('/login')
// })
app.delete('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function checkAuthenticated(req,res,next)
{
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
   return res.redirect('/')
  }
  next()

}




const PORT=process.env.PORT || 3002;
app.listen(PORT,()=>{
  console.log(`Server on ${PORT}`);
})