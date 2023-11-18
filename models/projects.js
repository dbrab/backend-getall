
const mongoose = require('mongoose');

const ProjectsModel = mongoose.model('Projects', { 
    code:String,
    name:String
});


module.exports={
    ProjectsModel
}