import mongoose from 'mongoose';

/**
 * Execute a MongoDB transaction with automatic rollback on error
 * @param {Function} callback - Async function that receives the session
 * @returns {Promise<any>} Result of the callback
 */
export const executeTransaction = async (callback) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const result = await callback(session);
    
    await session.commitTransaction();
    session.endSession();
    
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Execute a MongoDB transaction with retry logic for transient errors
 * @param {Function} callback - Async function that receives the session
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<any>} Result of the callback
 */
export const executeTransactionWithRetry = async (callback, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const result = await callback(session);
      
      await session.commitTransaction();
      session.endSession();
      
      if (attempt > 1) {
        console.log(`✅ Transaction succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      
      lastError = error;
      
      // Check if error is transient (retriable)
      const isTransientError = 
        error.hasErrorLabel?.('TransientTransactionError') ||
        error.code === 112 || // WriteConflict
        error.code === 11000; // DuplicateKey (might be transient)
      
      if (isTransientError && attempt < maxRetries) {
        console.log(`⚠️ Transient error on attempt ${attempt}, retrying...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        continue;
      }
      
      // Non-retriable error or max retries reached
      break;
    }
  }
  
  console.error(`❌ Transaction failed after ${maxRetries} attempts`);
  throw lastError;
};

/**
 * Check if MongoDB connection supports transactions
 * @returns {boolean} True if transactions are supported
 */
export const supportsTransactions = () => {
  const connection = mongoose.connection;
  
  // Transactions require replica set or sharded cluster
  if (!connection || !connection.db) {
    return false;
  }
  
  // Check if running on replica set
  const topology = connection.db.serverConfig;
  return topology?.constructor.name === 'ReplSet' || 
         topology?.constructor.name === 'Sharded';
};

/**
 * Validate stock availability for multiple products
 * @param {Array} items - Array of {product: ObjectId, quantity: Number}
 * @param {ClientSession} session - MongoDB session
 * @returns {Promise<Object>} { valid: Boolean, errors: Array }
 */
export const validateStockAvailability = async (items, session) => {
  const Product = mongoose.model('Product');
  const errors = [];
  
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    
    if (!product) {
      errors.push({
        productId: item.product,
        error: 'Product not found'
      });
      continue;
    }
    
    if (product.stock < item.quantity) {
      errors.push({
        productId: item.product,
        productName: product.name,
        error: `Insufficient stock. Available: ${product.stock}, Requested: ${item.quantity}`
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Rollback stock changes if order is cancelled
 * @param {ObjectId} orderId - Order ID
 * @param {ClientSession} session - MongoDB session (optional)
 * @returns {Promise<void>}
 */
export const rollbackStockChanges = async (orderId, session = null) => {
  const Order = mongoose.model('Order');
  const Product = mongoose.model('Product');
  
  const order = await Order.findById(orderId).session(session);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Restore stock for all items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      {
        $inc: {
          stock: item.quantity,
          sold: -item.quantity
        }
      },
      { session }
    );
  }
  
  console.log(`✅ Stock restored for cancelled order ${order.orderNumber}`);
};

export default {
  executeTransaction,
  executeTransactionWithRetry,
  supportsTransactions,
  validateStockAvailability,
  rollbackStockChanges
};
