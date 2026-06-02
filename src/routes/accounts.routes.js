const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const accountController = require('../controllers/account.controller');

const router = express.Router();

/**
 * post /api/accounts
 * create a new account for the authenticated user
 * protected route
 */
router.post("/",authMiddleware.authMiddleware,accountController.createAccountController);

/**
 * get /api/accounts
 * get all accounts for the authenticated user
 * protected route
 */
router.get("/",authMiddleware.authMiddleware,accountController.getAllAccountsController);

/**
 * get /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceController);

module.exports = router;