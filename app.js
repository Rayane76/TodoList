const express = require ("express")
const bodyParser = require ("body-parser")
const mongoose = require ("mongoose")
const _ = require("lodash")
const app = express()
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect('mongodb+srv://rayane:Rayane140820031921@cluster0.4cfsbfo.mongodb.net/todolistDB');


const itemSchema = {
  name: String
};
const Item = mongoose.model("Item",itemSchema);

const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List",listSchema);

const defaultList = new List ({
  name: "Today",
  items: []
})

const accountSchema = {
  username: String,
  password: String,
  lists: [listSchema]
}

const Account = mongoose.model("Account",accountSchema);

app.get("/",function(req,res){
   res.render("login",{message: ""});
 })

 app.post("/login",function(req,res){
   let userName = req.body.username;
   let passWord = req.body.password;
   async function isExisting () {
        const exist = await Account.findOne({username: userName});
         if (exist == null){
            res.render("login",{message: "Wrong username!"});
        }
        else {
          const compare = passWord.localeCompare(exist.password);
          if (compare == 0) {
            res.redirect("/Home?name=" + userName);
          }
          else {
            res.render("login",{message: "Wrong password!"})
          }
        }
       }
      isExisting();

 })


 app.get("/signup",function(req,res){
   res.render("signup",{message: ""});
 })


 app.post("/signup",function(req,res){
   let username = req.body.username;
   let password = req.body.password;
   async function isExisting () {
        const exist = await Account.findOne({username: username});
         if (exist == null){
            const newUser = new Account ({
              username: username,
              password: password,
              lists: [defaultList]
            })
            newUser.save();
            res.redirect("/Home?name=" + username);
        }
        else {
          res.render("signup",{message: "Username already exists !"})
        }
 }
 isExisting();
})

app.get("/Home",function(req,res){
  let user = req.query.name;
  async function affiche () {
  const exist = await Account.findOne({username: user});
  res.render("list",{item : exist.lists[0].items , account: user});
}
   affiche()
})
//
app.post("/Home",function(req,res){
   let todo = req.body.tache;
   let accName = req.body.accountName;
   var newItem = new Item ({name: todo});
     async function add () {
      const account = await Account.findOne({username: accName});
      account.lists[0].items.push(newItem);
      account.save();
     res.redirect("/Home?name=" + accName);
     }
     add();

})
//
app.post("/delete",function(req,res){
  const checked = req.body.checkbox;
  const listName = req.body.listName;
  const accName = req.body.accountName;
  //if (listName == "Today"){
    async function del () {
     const account = await Account.findOne({username: accName});
      const indexToDelete = account.lists[0].items.findIndex(item => item._id === checked)
      account.lists[0].items.splice(indexToDelete,1);
     account.save();
    }
    del();
    res.redirect("/Home?name=" + accName);
});

app.listen("3000")
