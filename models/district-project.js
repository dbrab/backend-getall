const mongoose = require('mongoose');

const DistrictProjectModel = mongoose.model('DistrictProjectt', { 
    code:String,
    projectname:String,
    PIM:String,
    CERTIFICATION:String,
    PORCENTAJE_AVANCE:String
});


module.exports={
    DistrictProjectModel
}

