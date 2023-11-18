const mongoose = require('mongoose');

const DistrictModel = mongoose.model('District', { 
    code:String,
    name:String,
    avance:{type:Number,default:0}
});


module.exports={
    DistrictModel
}