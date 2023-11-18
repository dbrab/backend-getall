const mongoose = require('mongoose');

const RegionProjectModel = mongoose.model('RegionProject', { 
    code:String,
    projectname:String,
    PIM:String,
    CERTIFICACION:String,
    PORCENTAJE_AVANCE:String
});


module.exports={
    RegionProjectModel
}