const mongoose = require('mongoose');

const ProvinceProjectModel = mongoose.model('ProvinceProjectt', { 
    code:String,
    projectname:String,
    PIM:String,
    CERTIFICACION:String,
    PORCENTAJE_AVANCE:String
});


module.exports={
    ProvinceProjectModel
}