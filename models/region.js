const mongoose = require('mongoose');

const RegionModel = mongoose.model('Region', { 
    code:String,
    name:String,
    avance:{type:Number,default:0}
});


module.exports={
    RegionModel
}