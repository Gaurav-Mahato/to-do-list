//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-gaurav:exceedzd@cluster0.tzwkp.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Comding"
});
const item2 = new Item({
  name: "Watching Anime"
});
const item3 = new Item({
  name: "Academics"
});

const collections = [];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox ;
  const listName = req.body.listInfo ;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});

app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if(result.length === 0){
      Item.insertMany(collections, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully inserted");
        }
      });
    }
    res.render("list", {listTitle: "Today", newListItems: result})
  })

});
app.get("/:listName",function(req,res){
  const customListName = _.capitalize(req.params.listName) ;
  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: collections
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
});

app.post("/", function(req, res){

  const item = req.body.newItem;
  const tasks = req.body.list ;
  const addedItem = new Item({
    name: item
  });
  if(tasks === "Today"){
    addedItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: tasks},function(err,foundList){
      foundList.items.push(addedItem);
      foundList.save();
      res.redirect("/"+foundList.name);
    })
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfully");
});
