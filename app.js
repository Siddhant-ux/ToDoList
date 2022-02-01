//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-siddhant:20092002@cluster0.kv15g.mongodb.net/todolistDB");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
  name: "Setup To Do List"
});
const item2 = new Item({
  name: "Follow To Do List"
})
const item3 = new Item({
  name: "Good Luck"
});
const defaultList = [item1, item2];


const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {
  Item.find({} ,function(err, items){
    if(err){
      console.log(err);
    }else{
      if(items.length === 0)
      {
        Item.insertMany(defaultList, function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Success");
          }
        });
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }
      }
    });
    });


    app.get("/:customList", function(req, res){
      const listName = _.capitalize(req.params.customList);
      List.findOne({name: listName}, function(err, result){
        if(!err){
          if(result === null){
            const listItem = new List({
              name: listName,
              items: defaultList
            });
            listItem.save();
            res.redirect("/" + listName);
        }else{
          res.render("list", {listTitle: result.name, newListItems: result.items});
        }
        }
      });

    });




app.post("/", function(req, res){
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const newItem = new Item({
    name: itemName
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, result){
      result.items.push(newItem);
      result.save();
      res.redirect("/" + listName);
    });
  }
});




app.post("/delete", function(req, res)
{
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.deleteOne({_id: itemId}, function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, result){
      if(!err){

        res.redirect("/" + listName);
      }
    });
  }


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
