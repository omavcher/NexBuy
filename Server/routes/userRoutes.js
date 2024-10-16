const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/sign-up', userController.SignUp);
router.post('/log-in', userController.LogIn);

router.post('/change-password', userController.PasswordChnage);


router.get('/reviews', userController.GetAllReviews);
router.get('/review/:id', userController.ReviewGetByID);
router.post('/reviews/create', auth, userController.ReviewSubmit);

router.get('/user/:userId', userController.GetUserInfoById);
router.get('/u', userController.FinduBrands);

router.post('/verify-token', userController.VerifyToken);
router.get('/user-details', auth, userController.Userdetails);
router.get('/orders', auth, userController.Orderdetails);
router.get('/addresses', auth, userController.Addressesdetails);
router.put('/addresses', auth, userController.AddressesEdit);
router.post('/addresses', auth, userController.AddressesCreate);



router.get('/users/:userId/payment-methods', auth, userController.getPaymentMethods);
router.post('/users/:userId/payment-methods', auth, userController.addPaymentMethod);
router.patch('/users/:userId/payment-methods/:id/default', auth, userController.setDefaultPaymentMethod);


router.post('/register-business', auth, userController.RegisterbusinessAcc);

router.get('/cart', auth, userController.GetCartItems);
router.patch('/cart/:productId', auth, userController.updateQuantity);
router.delete('/cart/:productId', auth, userController.removeFromCart);
router.post('/favorites', auth, userController.addToFavorites);

router.post('/cart/add', auth, userController.addToCart);


router.post('/submit-order',  userController.SubmitOrder);

router.post('/verify-payment',  userController.VerifyOrder);

router.get('/users/orders/detail/:orderedId',auth,  userController.GetOrderDetailById);

router.post('/feedback', auth, userController.SubmitFeedback);


module.exports = router;
