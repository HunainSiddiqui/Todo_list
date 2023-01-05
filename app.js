//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-hunain:dragonx123@cluster0.mjcd13o.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);
const doc1 = new Item({
    name: "Welcome to Todo List"
})
const doc2 = new Item({
    name: "Hit + to Add Item"
})
const doc3 = new Item({
    name: "Hit CheckBox to Delete Item"
})
const docArray = [doc1, doc2, doc3];
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

    // var today = new Date();
    // var options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // }

    // var day = today.toLocaleDateString("en-US",options) ;





    Item.find({}, function (err, founditem) {
        //console.log(founditem) ;
        if (founditem.length === 0) {
            Item.insertMany(docArray, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Reseted");
                }
            })
            res.redirect("/");
        }
        else {
            res.render("list", { key: "Today" , nli: founditem });
        }

    })



});

app.post("/", function (req, res) {
    let item = req.body.newitem;
    const listname = req.body.list;
    const newitem = new Item({
        name: item
    })

    if (listname === "Today") {
        newitem.save();
        res.redirect("/");

    }
    else {
        List.findOne({ name: listname }, function (err, foundlist) {
            foundlist.items.push(newitem);
            foundlist.save();
            res.redirect("/" + listname);

        })
    }


})
app.post("/delete", function (req, res) {
    const checkitemid = req.body.check;
    const listname = req.body.listname;
    if (listname === "Today") {
        Item.findByIdAndRemove(checkitemid, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Successfully Deleted");

            }
            res.redirect("/");
        })
    }
    else {
        List.findOneAndUpdate({ name: listname }, { $pull: { items: { _id: checkitemid } } }, function (err, foundlist) {
            if (!err) {
                res.redirect("/" + listname);
            }
        })
    }


})

app.get("/:customlist", function (req, res) {
    const customlistname = req.params.customlist;
    List.findOne({ name: customlistname }, function (err, foundlist) {
        if (!err) {
            if (!foundlist) {
                const list = new List({
                    name: customlistname,
                    items: docArray
                })
                list.save();
                res.redirect("/" + customlistname);

            }
            else {
                res.render("list", { key: foundlist.name, nli: foundlist.items });
            }
        }
    })

})














app.listen(5000, function () {
    console.log("Server started on port 5000.");
});
