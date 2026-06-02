const mongoose = require('mongoose');



function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('server is Connected to DB');
    })
.catch((err)=>{
    console.error('Error connecting to DB',err);
    process.exit(1);
});
}

module.exports = connectDB;