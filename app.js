const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const passport = require("passport");
const ejs = require('ejs');
var path = require("path");

const Material = require('./models/material');
const Suppliers = require('./models/supplier');

const app = express();
const session = require("express-session");
const mongoSanitize = require("express-mongo-sanitize");
const MongoDbStore = require("connect-mongo");

app.use(session({
    secret : process.env.SESSION_SECERT ,
    resave : false,
    store : MongoDbStore.create({ mongoUrl: process.env.MONGOURI  }),
    saveUninitialized : false,
    cookie : {  maxAge : 10000 * 60 * 60 * 24} /// 24hrs
}));

mongoose.connect(
  process.env.MONGOURI,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
   }
)
.catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.json());//parsing the application/json
app.use(express.urlencoded({ extended: false }));//parses the x-www-form-urlencoded
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
// function today(){
//     var date = new Date();
//     var todaydate = date.toDateString();
//     var minutes = date.getUTCMinutes();
//     var hours = date.getHours();
//     var seconds = date.getSeconds();
//     var format = hours+':'+minutes+':'+seconds+' '+todaydate;
//     return format ;
// };

//getting to the index
app.get('/',(req ,res)=>{
    res.render('index');
});
//getting addmaterial page
app.get('/addmaterial' , (req ,res)=>{
    res.render('addmaterial');
});
//getting editmaterial page
app.get('/editmaterial/:id',async(req, res)=>{
    var id = req.params.id;
    const material = await Material.findById(id);
    res.render('editmaterial',{ id:id,name:material.name,state:material.state,price:material.price,qty:material.qty });
});
//getting materials
app.get('/materials',async(req , res)=>{
    const materials = await Material.find({});
    //console.log(materials)
    // await Material.find((err , materials)=>{
    //     if(err){
    //         console.log(err)
    //         res.render('material' , {
    //             msg:'Error in getting details..' 
    //         });
    //     }
    //     else{
    //     // let obj = materials;
    //     console.log(materials);

       res.render('material', { obj:materials } );
    //     }
    // }) 
});
// add the materials 
app.post('/addmaterial',(req, res)=>{
    var name = req.body.name;
    var price = req.body.price;
    var qty = req.body.qty;
    var state = req.body.state;
    var on = new Date();
    Material.addMaterial({
        name:name,price:price,qty:qty,state:state,created_on:on
    } , (err , material)=>{
        if(err)
        { res.render('addmaterial', {
            msg:'Please fill required details!'
        })}
        var obj = material;
        // res.render('addmaterial' , {
        //     msg:'successfully submit!!'
        //});
        res.redirect('/materials');  
    });
});
// update the material data
app.post('/editmaterial/:id', async(req ,res)=>{
    var  id = req.params.id;
    var name = req.body.name;
    var price = req.body.price;
    var qty = req.body.qty;
    var state = req.body.state;
    //for creating date
    var on = today();
    await Material.updateMaterial(id , {
        name:name,price:price,qty:qty,state:state,created_on:on
    },{}, (err , callback)=>{
        if(err){
            res.render('editmaterial', {msg:"Error Occured."});
        }
        // res.render('editmaterial' ,{ id:id ,msg:"Successfully updated!!"} );
        res.redirect('/materials');
    });
 });
//delete the data of materials
app.post('/deletematerial/:_id',(req , res)=>{
    var id = req.params._id;
    Material.removeMaterial(id , (err ,callback)=>{
        if(err){throw err}
        res.redirect('/materials');
        } );
});
app.post('/showmaterials/:id',(req ,res)=>{
    var id = req.params.id;
    Material.findbyid(id , (err , materials)=>{
        if(err){throw err;}
        var obj = materials;
        res.render('showmaterials', {obj:obj});
    });
});
//--------------------------------------------------
app.get('/addsupplier',(req,res)=>{
    res.render('addsupplier');
});
app.get('/editsupplier/:id',(req,res)=>{
    var id = req.params.id;
    res.render('editsupplier', {id:id});
});
// finds the suppliers
app.get('/suppliers',async(req, res)=>{
        await Suppliers.find((err , suppliers)=>{
            if(err)
            {
                res.render('supplier' , {
                    msg:'some error occured!!'
                });
            }
            let obj = suppliers; 
            res.render('supplier' , {obj:obj});
        });
});
app.post('/addsupplier' , (req ,res)=>{
    var cmpname = req.body.cmpname;
    var materialname = req.body.materialname;
    var state = req.body.state;
    var emailid = req.body.emailid;
    var contactno =req.body.contactno;
    var address = req.body.address;
    var costprice = req.body.costprice;
    var qty = req.body.qty;
    var on = today();
    var supplier = {cmpname:cmpname, materialname:materialname, state:state, emailid:emailid, 
                contactno:contactno, address:address, costprice:costprice, qty:qty ,created_on:on };
    Suppliers.addSupplier(supplier , (err , supplier)=>{
        if(err){throw err}
        res.redirect('/suppliers');
    })
});
// //add suppliers
// app.post('/addsupplier',(req ,res)=>{
//     var supplier = req.body;
//     Suppliers.addSupplier(supplier , (err, supplier)=>{
//         if(err){
//             throw err; 
//         }
//         res.json(supplier);
//     });
// });
//update the supplier data
app.get('/showsupplier/:id',(req , res)=>{
    var id = req.params.id;
    Suppliers.getSuppliersById(id , (err , supplier)=>{
        if(err){throw err}
        var obj = supplier;
        res.render('showsupplier', {obj:obj});
    });
});
app.post('/editsupplier/:_id',(req ,res)=>{
    var id = req.params._id;
    var cmpname = req.body.cmpname;
    var materialname = req.body.materialname;
    var state = req.body.state;
    var emailid = req.body.emailid;
    var contactno = req.body.contactno;
    var address = req.body.address;
    var costprice = req.body.costprice;
    var qty = req.body.qty;
    var on = today();
    var supplier = {cmpname:cmpname, materialname:materialname, state:state, emailid:emailid, 
                contactno:contactno, address:address, costprice:costprice, qty:qty ,created_on:on };
    Suppliers.updateSupplier(id , supplier ,{},(err , supplier)=>{
        if(err){
            throw err
        }
        res.redirect('/suppliers');
    });
} );
//delete the data from supplier ...
app.post('/deletesupplier/:_id',(req,res)=>{
    var id = req.params._id;
    Suppliers.removeSupplier(id, (err , callback)=>{
        if(err){throw err}
        res.redirect('/suppliers');
    });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server started on port 3000");
});