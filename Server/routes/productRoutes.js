const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController.js');


router.post('/product-names', productController.AllProductNameSuggesttion);
router.get('/product/:productId', productController.DetailedProductByID);
router.get('/all-product', productController.AllProducts);
router.get('/brands/:name', productController.FindBrandByName);

router.get('/om', productController.OM);

module.exports = router;
