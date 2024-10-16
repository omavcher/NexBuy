const businessAuth = (req, res, next) => {
    const account_type = req.headers['account_type']; 

    if (account_type === 'business') {
        next(); 
    } else {
        return res.status(401).json({ message: 'You are not eligible for this!, error in your business account' });
    }
};

module.exports = businessAuth;
