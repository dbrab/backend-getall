const mongoose = require('mongoose');

const ProvinceModel = mongoose.model('Province', { 
    code:String,
    name:String,
    avance:{type:Number,default:0}


});


module.exports={
    ProvinceModel
}