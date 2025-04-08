const { body, validationResult } = require('express-validator')
const validate = {}

/*  **********************************
 *  Movies Data Validation Rules
 * ********************************* */
validate.createProductRules = () => {
  return [
    // Title is required and must be a string
    body('name')
      .isString()
      .withMessage('Name must be a string.')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('Please provide a name.')
      .isLength({ min: 1 })
      .withMessage('Name must be at least 1 character long.'),

    // Release Year is required and must be a valid integer
    body('price')
      .notEmpty()
      .withMessage('Please enter the price')
      .isFloat({ min: 0.01})
      .withMessage('Price must be a number.'),

    body('quantity')
      .trim()
      .notEmpty()
      .withMessage("Please enter the price.")
      .isInt()
      .withMessage(
        "You are not entering an integer"
      ),

    // Genre is required and must be a string
    body('supplier')
      .isString()
      .withMessage('Supplier must be a string.')
      .trim()
      .notEmpty()
      .withMessage('Please enter the supplier.')
      .isLength({ min: 2 })
      .withMessage('Supplier must be at least 2 characters long.'),

    // Director is required and must be a string
    body('category')
      .isString()
      .withMessage('Category must be a string.')
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the category.")
      .isLength({ min: 2 })
      .withMessage("Category name must be at least 2 characters long."),

  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkCreateProductData = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(400).json({
    errors: extractedErrors
  })
}

module.exports = validate
