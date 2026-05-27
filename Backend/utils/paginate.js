/**
 * @desc Reusable Pagination Utility
 * Extracts pagination logic into a shared function.
 * @param {Object} model - Mongoose model to query
 * @param {Object} filter - MongoDB filter object
 * @param {Object} options - { page, limit, sort, select }
 * @returns {Object} { data, page, limit, totalPages, totalDocs }
 */
const paginate = async (model, filter = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const select = options.select || '';

  const [data, totalDocs] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).select(select).lean(),
    model.countDocuments(filter),
  ]);

  return {
    data,
    page,
    limit,
    totalPages: Math.ceil(totalDocs / limit),
    totalDocs,
  };
};

module.exports = paginate;
