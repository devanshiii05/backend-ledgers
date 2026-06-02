const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');


/**
 * Create a new transaction
 * the 10 steps to create a transaction are as follows:
 * 1. validate the request body
 * 2.validate idempotency key
 * 3.check account status
 * 4.derive sender balance from ledger
 * 5.create transaction document
 * 6.create debit ledger entry
 * 7.create credit ledger entry
 * 8.mark transaction as completed
 * 9.commit mongodb session
 * 10.send email notification to the user
 */

async function createTransaction(req,res){
    /**
     * 1. validate the request body
     */
    const {fromAccount,toAccount,amount,idempotencyKey} = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount, toAccount, amount and idempotencyKey are required"
        });
    }


const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
});

const toUserAccount = await accountModel.findOne({
    _id: toAccount,
});

if(!fromUserAccount || !toUserAccount){
    return res.status(404).json({
        message:"fromAccount or toAccount not found"
    });
}

/**
 * 2.validate idempotency key
 */
const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey
});

if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === 'completed'){
       return res.status(200).json({
            message:"transaction already completed",
            transaction: isTransactionAlreadyExists
        });
    }
    if(isTransactionAlreadyExists.status === 'pending'){
        return res.status(200).json({
            message:"transaction is still processing",
        });
    }
    if(isTransactionAlreadyExists.status === 'failed'){
        return res.status(500).json({
            message:"transaction already failed",
            
        });
    }
    if(isTransactionAlreadyExists.status === 'reversed'){
        return res.status(500).json({
            message:"transaction already reversed",
        });
}

}

/**
 * 3.check account status
 */
if(fromUserAccount.status !== 'active' || toUserAccount.status !== 'active'){
    return res.status(400).json({
        message:"fromAccount or toAccount is not active"
    });
}
 
/**
 * 4.derive sender balance from ledger
 */

const balance= await fromUserAccount.getBalance();
if(balance < amount){
    return res.status(400).json({
        message:`insufficient balance. Current balance is ${balance}.Requested amount is ${amount}`
    });
}

let transaction;
try{

/**
 * 5.create transaction document
 */
const session = await mongoose.startSession();
session.startTransaction();

 transaction = (await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: 'pending'
}], { session }))[0];   



const debitLedgerEntry = await ledgerModel.create([{
    account: fromAccount,
    amount,
    transaction: transaction._id,
    type: 'debit'
}], { session });

 await (() => {
            return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        })();

const creditLedgerEntry = await ledgerModel.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: 'credit'
}] , { session });  


await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        );


await session.commitTransaction();
session.endSession();
}catch(error){

    return res.status(400).json({
        message:"transaction is ending with error",      
    });
}
/**
 * 10.send email notification to the user
 */
await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount);
 
return res.status(201).json({
    message:"transaction completed successfully",
    transaction: transaction
});
}

async function createInitialFundsTransaction(req,res){
    // Implementation for creating initial funds transaction
    const {toAccount,amount,idempotencyKey} = req.body;
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount, amount and idempotencyKey are required"
        });
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    });
    if(!toUserAccount){
        return res.status(400).json({
            message:"toAccount not found"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        user:req.user._id
    });
    if(!fromUserAccount){
        return res.status(400).json({
            message:"system account not found for the user"
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: 'pending'
    })



    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: 'debit'
    }], { session });

   
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: 'credit'
    }], { session });

    transaction.status = 'completed';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message:"initial funds transaction completed successfully",
        transaction: transaction
    });

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction   
};
