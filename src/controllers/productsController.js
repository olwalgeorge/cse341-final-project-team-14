const { ObjectId } = require('mongodb')
const productsModels = require('../models/productsModels')

const listAllProducts = async (req, res) => {
  //#swagger.tags = ['Products']
  try {
    const products = await productsModels.getAllProducts()
    res.setHeader('Content-Type', 'application/json')
    res.status(200).json(products)
  } catch (err) {
    console.error('Error fetching products', err.message)
    res.status(500).json({ message: err.message || 'Internal server error.' })
  }
}

const listAProduct = async (req, res) => {
    const productId = req.params.id
    try{
        if(!ObjectId.isValid(productId)){
            throw new Error("The product ID is incorrect!")
        }
        const listedProduct = await productsModels.getAProduct(productId)
        res.setHeader("Content-Type", "application/json")
        res.status(200).json(listedProduct)
    }catch(err){
        res.status(400).json({message: err.message})
    }
}

const insertAProduct = async (req, res) => {
  //#swagger.tags = ['Products']
  //#swagger.consumes = ['application/json']
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Add a product',
      required: true,
      schema: { $ref: '#/definitions/Product' }
  } */
  try {
    const objectData = req.body
    const product = await productsModels.addAProduct(objectData)
    res.setHeader('Content-Type', 'application/json')
    res
      .status(201)
      .json({ message: 'You successfully added a new product', id: product._id })
  } catch (err) {
    console.error('Failed to insert a product')
    res.status(400).json({ message: err.message || 'A server error occured.' })
  }
}

const modifyAProduct = async (req, res) => {
  //#swagger.tags = ['Product']
  //#swagger.consumes = ['application/json']
  /* #swagger.parameters['body'] = {
      in: 'body',
      description: 'Edit a product',
      required: true,
      schema: { $ref: '#/definitions/Product' }
  } */
  try {
    const productId = req.params.id
    const productData = req.body
    if (
      !productData.name ||
      !productData.price ||
      !productData.quantity ||
      !productData.supplier ||
      !productData.category 
    ) {
      throw new Error('All the fields must be included')
    }
    const updatedProduct = await productsModels.updateAProduct(productId, productData)
    res.setHeader('Content-Type', 'application/json')
    res
      .status(201)
      .json({ message: 'Product was updated succesfully', id: updatedProduct._id })
  } catch (err) {
    res.status(500).json({ message: err.message || 'A server error occured.' })
  }
}

const removeAProduct = async (req, res) => {
  //#swagger.tags = ['Products']
  const deletedProduct = await productsModels.deleteAProduct(req.params.id)
  res.setHeader('Content-Type', 'application/json')

  if (deletedProduct.error) {
    return res.status(400).json(deletedProduct) // Send the error message from the model function
  }

  res.status(200).json(deletedProduct)
  // try{
  //   const movieId = req.params.id
  //   const deletedMovie = moviesModel.deleteAMovie(movieId)
  //   res.setHeader('Content-Type', 'application/json')
  //   res.status(200).json(deletedMovie)
  // }catch(err){
  //   res.status(500).json({error: err.message})
  // }
}

module.exports = { listAllProducts, listAProduct, insertAProduct, modifyAProduct, removeAProduct }