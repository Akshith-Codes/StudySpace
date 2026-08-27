const ApiError = require('../utils/ApiError');

// Generic Zod-based validator. Pass a zod schema; it validates req.body
// (or req.query / req.params if specified) and throws a 422 ApiError with
// field-level messages on failure.
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ApiError(422, 'Validation failed', errors);
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
