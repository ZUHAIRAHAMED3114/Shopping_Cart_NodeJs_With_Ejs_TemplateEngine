const router = require('express').Router();

/*
      Get Pages index
*/


router.get('', (req, res) => {
    res.render('index', {
        title: 'front'
    })
})



module.exports = router;