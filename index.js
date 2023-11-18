const mongoose = require('mongoose');

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const express = require('express');
const app = express();
const cors = require("cors");
const { DistrictModel } = require('./models/district');
const { DistrictProjectModel } = require('./models/district-project');
const { RegionModel } = require('./models/region');
const { RegionProjectModel } = require('./models/region-project');
const { datad } = require('./controllers/datad');
const { mapear } = require('./controllers/mapear');
const { datar } = require('./controllers/datar');
const { datap } = require('./controllers/datap');
const { ProvinceModel } = require('./models/province');
const { ProvinceProjectModel } = require('./models/province-project');

app.use(cors());
const port = 8087;
app.listen(port, () => console.log(`Server is running on port ${port}`));

const mongoUri = 'mongodb+srv://dan:1gnpGRlGNJWyMjgo@cluster0.k5porcz.mongodb.net/';

mongoose.connect(mongoUri).then(() => {
    console.log("=== MongoDB Connected ===");
}).catch(err => {
    console.error("=== MongoDB connection error ===", err);
});



    //data de las provincias de amazonas


//solo sirve para obtener las relaciones de region-distrito-provincia, como esto rara vez cambia solo es recomendable correrlo 1 vez

app.get("/mapear",mapear); //mapeamos las regiones en general, las provinciias de amazonas y los distritos de las provincias de amazonas

app.get("/datar",datar);

app.get("/datad",datad);
app.get("/datap",datap)

app.get('/getdatall', async (req, res) => {
    try {

        const dataRegion = await RegionModel.find({})
        const dataProvince = await ProvinceModel.find({})
        const dataDistrict = await DistrictModel.find({});
        const data = {
            region: dataRegion,
            province: dataProvince,
            distrito: dataDistrict
        };
        res.json(data);
    } catch (error) {
        console.error("Error fetching data from MongoDB:", error);
        res.status(500).json({ error: 'An error occurred', errorMessage: error.message, stack: error.stack });
    }
});


app.get("/provinces/:code/projects",async(req,res)=>{
    const code=req.params.code;
    const projects=await ProvinceProjectModel.find({code:code});
    res.status(200).send({data:projects})
})

app.get("/regions/:code/projects",async(req,res)=>{
    const code=req.params.code;
    const projects=await RegionProjectModel.find({code:code});
    res.status(200).send({data:projects})
})

app.get("/districts/:code/projects",async(req,res)=>{
    const code=req.params.code;
    const projects=await DistrictProjectModel.find({code:code});
    res.status(200).send({data:projects})
})