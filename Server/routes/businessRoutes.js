const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController.js');
const auth = require('../middlewares/auth');
const businessAuth = require('../middlewares/business_auth.js');
const upload = require('../config/multer-config.js'); 



router.get('/product-detail', auth, businessAuth, businessController.ProductDetail);

router.post('/create-product',upload.array('images'), auth, businessAuth, businessController.createProduct);

router.put('/listed_product/:selectedProduct', auth, businessAuth, businessController.editListedProduct);

router.delete('/listed_product/:selectedProduct', auth, businessAuth, businessController.deleteListedProduct);

router.put('/update-brand', auth, businessAuth, businessController.updateBrandInfo);


router.get('/order-info/:brand',auth, businessController.OrderInfoForBrand);

router.post('/order-info-by-id',auth, businessController.OrderInfoByIds);

router.put('/order/update-status',auth, businessController.ChangeOrderStatus);


router.get('/brand-name',auth, businessController.GetBrandName);

module.exports = router;
