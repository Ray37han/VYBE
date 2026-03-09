/**
 * Pagination helper for consistent API responses
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Pagination options
 * @returns {Object} Paginated results with metadata
 */
export const paginate = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 50, // Increased default to show more products
    sort = { createdAt: -1 },
    select = '',
    populate = null,
    lean = true
  } = options;

  // Ensure valid numbers
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(500, Math.max(1, parseInt(limit))); // Max 500 items per page
  const skip = (pageNum - 1) * limitNum;

  try {
    // Execute query with pagination
    let queryBuilder = model
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Apply select if provided
    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    // Apply populate if provided
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => {
          queryBuilder = queryBuilder.populate(pop);
        });
      } else {
        queryBuilder = queryBuilder.populate(populate);
      }
    }

    // Apply lean for better performance
    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    // Execute query and count in parallel
    const [results, totalCount] = await Promise.all([
      queryBuilder.exec(),
      model.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      success: true,
      data: results,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? pageNum + 1 : null,
        prevPage: hasPrevPage ? pageNum - 1 : null
      }
    };
  } catch (error) {
    throw new Error(`Pagination error: ${error.message}`);
  }
};

/**
 * Parse pagination parameters from request query
 * Supports both legacy (sortBy/order) and new (sort=price_asc) formats
 * @param {Object} query - Express req.query object
 * @returns {Object} Parsed pagination options
 */
export const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 12;

  // New sort format: ?sort=price_asc, price_desc, newest, trending, rating
  const sortPresets = {
    price_asc: { basePrice: 1 },
    price_desc: { basePrice: -1 },
    newest: { createdAt: -1 },
    trending: { sold: -1, createdAt: -1 },
    rating: { 'rating.average': -1 },
    oldest: { createdAt: 1 },
  };

  let sort;
  if (query.sort && sortPresets[query.sort]) {
    sort = sortPresets[query.sort];
  } else if (query.sortBy) {
    // Legacy format: ?sortBy=createdAt&order=desc
    // Also handles frontend format like sortBy=-basePrice
    const sortField = query.sortBy.replace(/^-/, '');
    const sortOrder = query.sortBy.startsWith('-') ? -1 : (query.order === 'asc' ? 1 : -1);
    sort = { [sortField]: sortOrder };
  } else {
    sort = { createdAt: -1 };
  }

  return { page, limit, sort };
};
