const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,'Email is required'],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Please fill a valid email address'],
        unique:[true,'Email already exists']
    },
    name:{
        type:String,
        required:[true,'Name is required'],
    
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:[6,'Password must be at least 6 characters long'],
        select:false
        },
        systemUser:{
            type:Boolean,
            default:false,
            immutable:true,
            select:false
        }
},{
    timestamps:true
});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
         return;
    }
    const hash= await bcrypt.hash(this.password,10);
    this.password=hash;
    
    return ;
});

userSchema.methods.comparePassword= async function(Password){
    return await bcrypt.compare(Password,this.password);
}

const UserModel = mongoose.model('User',userSchema);

module.exports = UserModel;