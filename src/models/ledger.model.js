const moongoose = require('mongoose');

const ledgerSchema = new moongoose.Schema({
    account: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true, 'account is required'],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, 'amount is required'],
        immutable: true
    },
    transaction: {
        type: moongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'ledger must be associated with a transaction'],
        index: true,
        immutable: true
    },

    type: {
        type: String,
        enum: {
            values: ['debit', 'credit'],
            message: 'type must be either debit or credit'
        },  
        required: [true, 'type is required'],
        immutable: true
    }
});

function preventLedgerModification(){
    throw new Error('Ledger entries cannot be modified');
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const LedgerModel = moongoose.model('Ledger', ledgerSchema);

module.exports = LedgerModel;