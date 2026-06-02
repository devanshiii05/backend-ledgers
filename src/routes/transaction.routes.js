const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require('../controllers/transaction.controller');

const transactionRoutes = Router();

/**
 * post /api/transactions
 * create a new transaction for the authenticated user  
 */

transactionRoutes.post("/", authMiddleware.authMiddleware, transactionController.createTransaction);

/** 
 * post /api/transactions/system/initial-funds
 * create initial funds transaction from system user
*/
transactionRoutes.post("/system/initial-funds", authMiddleware.authUserMiddleware, transactionController.createInitialFundsTransaction);
module.exports = transactionRoutes;