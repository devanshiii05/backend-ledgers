const mongoose = require('mongoose');



const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'token is required to blacklist'],
        unique: [true, 'token is already blacklisted']
    }
},{
    timestamps: true
}
);

tokenBlacklistSchema.index({ createdAt: 1 },{
    expiresAfterSeconds: 60*60*24*3
});

const tokenBlacklistModel = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = tokenBlacklistModel;