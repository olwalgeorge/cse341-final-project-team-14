const ProductsModel = require('./productsSchema')
const { ObjectId } = require('mongodb')

const getAllProducts = async () => {
  try {
    const result = await ProductsModel.find()
    if (!result || result.length === 0) {
      throw new Error('Sorry, no product was found.')
    }
    return result
  } catch (err) {
    throw new Error(err.message)
  }
}

const getAProduct = async (productId) => {
    try{
        if(!ObjectId.isValid(productId)){
            throw new Error("The product ID you have provided is invalid")
        }
        const result = await ProductsModel.findById(productId)
        if(!result || result.length === 0){
            throw new Error("No product was found with this Id")
        }
        return result
    }catch(err){
        return {error: err.message}
    }
}

const addAProduct = async (objectData) => {
  try {
    const { name, price, quantity, supplier, category} =
      objectData
    if (
      !name ||
      !price ||
      !quantity ||
      !supplier ||
      !category 
    ) {
      throw new Error('All the fields must be present')
    }
    const result = await ProductsModel.create(objectData)
    return result
  } catch (err) {
    throw new Error(err.message)
  }
}

const updateAProduct = async (productId, productData) => {
  try {
    if (!ObjectId.isValid(productId)) {
      throw new Error('Your product ID is incorrect')
    }
    // const {title, director, releaseYear, genre, rating, duration, cast} = movieData
    const result = await ProductsModel.findByIdAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: productData },
      { new: true }
    )
    
    // Should remove matchedCount and modifiedCount because they don't work with "findByIdAndUpdate"
    if (result.matchedCount === 0) {
      return { message: 'No product was found with this ID' }
    }
    if (result.modifiedCount === 0) {
      return {
        message: 'No changes made, the product data is already up to date.'
      }
    }
    return {
      message: 'Product updated successfully',
      modifiedCount: result.modifiedCount
    }
  } catch (err) {
    console.error(err.message)
    return { err: err.message }
  }
}

const deleteAProduct = async (productId) => {
  try {
    if (!ObjectId.isValid(productId)) {
      throw new Error('No product found with the given ID')
    }
    const result = await ProductsModel.findOneAndDelete({
      _id: new ObjectId(productId)
    })
    if (!result) {
      throw new Error('No product was deleted.')
    }
    return {
      message: 'A product has been successfully deleted!',
      deletedProduct: result
    }
  } catch (err) {
    console.error(err.message)
    return { error: err.message }
  }
}

module.exports = {
  ProductsModel,
  getAllProducts,
  getAProduct,
  addAProduct,
  updateAProduct,
  deleteAProduct
}
