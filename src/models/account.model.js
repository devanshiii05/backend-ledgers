const mongoose = require('mongoose');
const ledgerModel = require('./ledger.model');

const accountSchema = new mongoose.Schema({
    user:{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'account must be associated with a user'],
        index: true
    },
    status: {
        type: String,
        enum:{
            values: ['active', 'frozen', 'closed'],
            message: 'status must be either active, frozen or closed'
        },
         default: 'active'
},
currency: {
    type: String,
    required: [true, 'currency is required'],
    default: 'INR'
}
},
{
    timestamps: true
}
);

accountSchema.index({ user: 1 ,status: 1});

accountSchema.methods.getBalance = async function() {

    const balanceData = await ledgerModel.aggregate([
        { $match: { account:(this._id) } },
            {
            $group: {
                _id: null,
                totalDebits: {
                    $sum: {
                        $cond: [{ $eq: ['$type', 'debit'] }, 
                        '$amount',
                         0
                        ]
            }
        },
        totalCredits: {
            $sum: {
                $cond: [{ $eq: ['$type', 'credit'] },
                '$amount',
                    0
                ]
            }
        }
    }
    },
    {
        $project: {
            _id: 0,     
            balance: { $subtract: ['$totalCredits', '$totalDebits'] }
        }
    }      
    ]);
   if(balanceData.length === 0){
    return 0;
   }    
    return balanceData[0].balance;
};

const AccountModel = mongoose.model('Account', accountSchema);



module.exports = AccountModel;