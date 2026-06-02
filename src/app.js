const express = require('express');
const cookieParser = require('cookie-parser');



const app = express();


app.use(express.json());
app.use(cookieParser());

/**
 * routes
 */
const authRoutes = require('./routes/auth.routes');
const accountRoutes = require('./routes/accounts.routes');
const transactionRoutes = require('./routes/transaction.routes');

/**
 * use routes
 */
app.use("/api/auth",authRoutes);
app.use("/api/accounts",accountRoutes);
app.use("/api/transactions",transactionRoutes);


module.exports = app;