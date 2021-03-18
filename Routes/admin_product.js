const router = require('express').Router();
const fsExtra = require('fs-extra');
const mkDirp = require('mkdirp');
const fs = require('fs');
const resizeimage = require('resize-img');
const { route } = require('./pages');
const { body, validationResult } = require('express-validator');
const newPath = require('path');

const Product = require('../models/product');
const Categroy = require('../models/category');
const mkdirp = require('mkdirp');

// this routes for the presenting the list of all the products whic are available
router.get('/', async(req, res) => {
    let count;
    count = await Product.countDocuments({})
    console.log(count);
    let products = await Product.find({});
    res.render('admin/products', {
        products,
        count
    })

})

router.get('/add-product', async(req, res) => {
    let title = "";
    let description = "";
    let price = "";

    categories = await Categroy.find({});






    res.render('admin/add_product', {
        title,
        description,
        price,

        categories
    })
});


router.get('/edit-product/:id', async(req, res) => {




    categories = await Categroy.find({});


    Product.findOne({
        _id: req.params.id
    }).then(product => {
        console.log(product)
        var rootDirectory = 'public/product_image/' + req.params.id + '/gallery';
        //var galleryDir = newPath.join(rootDirectory, 'gallery');
        //console.log(galleryDir)
        let imageGallery = null;

        fs.readdir(rootDirectory, (err, files) => {
            if (err) {
                console.log('error are present during the file reading ')
                console.log(err)

            } else {
                imageGallery = files;

                res.render('admin/edit_product', {
                    title: product.title,
                    description: product.description,
                    price: parseFloat(product.price).toFixed(2),
                    tcategory: product.category,
                    id: product._id,
                    timage: product.image,
                    galleryImage: imageGallery,
                    categories
                })


            }
        })





    }).catch(err => {
        console.log(err);
        res.redirect('/admin/products')
    })

});

router.get('/delete-product/:id', (req, res) => {

    /*
         deleteDirectorySynchrnously,
         getParentAddres

         these  are the two helper method are declare

         where:->
            deleteDirectorySynchronously:-> is used to delete the whole directory recursively
            getParentAddress :-> this path is to be used to get the parent--> grand parent --> grand_grand Parent 
            based on the parameter we specified 

    */

    /*
        first we are deleting the files/image related to i.e id after i.e 
       we are deleting the document/data which is present in the mongoDb data base
    */

    let deleteDirectorySynchronously = (path) => {
        if (fs.statSync(path).isDirectory()) {

            fs.readdirSync(path).forEach(file => {
                var newpath = newPath.join(path, file);
                console.log(newpath);
                deleteDirectorySynchronously(newpath);

            })

            fs.rmdirSync(path);


        } else {

            fs.unlinkSync(path);

        }

    };

    let getParentAddress = function(path, number) {
        // here put the validation for the path and the number through regular expression 

        var colleciton = path.split('\\');
        var length = colleciton.length - number
        colleciton = colleciton.slice(0, length);

        var newPath = colleciton.join('\\');
        return newPath;
    }


    let id = req.params.id;
    var imagepath = "";

    try {

        imagepath = getParentAddress(__dirname, 1);
        let directoryPath = newPath.join(imagepath, 'public', 'product_image', id);
        console.log(directoryPath);
        deleteDirectorySynchronously(directoryPath);

        Product.findByIdAndRemove(id)
            .then((success) => {
                console.log('deleted from the database successfully ' + success)
                res.redirect('/admin/products');
            })
            .catch((err) => {
                console.log(`error occured during the deleting `)
            })


    } catch (error) {

        console.log(`error occured during the file deleting ${error}`)
    }


});






router.post('/add-product', body('title', 'Title Must Have a Value').notEmpty(), body('description', 'Description Must Have a Value').notEmpty(),
    body('price', 'price must have a value').isDecimal(),
    body('image', 'must fill the jpg,jpeg,png files ').custom((value, { req, path, location }) => {


        function isValidName(e) {
            return (/\.(png|bmp|jpe?g|jfif)/i).test(e);
        };

        return isValidName(req.files.image.name)
    })


    , async(req, res) => {


        let title = req.body.title !== "" ? req.body.title : "";
        let description = req.body.description != "" ? req.body.description : "";
        let category = req.body.category != "" ? req.body.category : "";
        let price = req.body.price != "" ? req.body.price : "";
        let slug = title.replace(/\s+/g, '-');

        let image = "";
        let categories = await Categroy.find({});
        var results = validationResult(req);
        var errors = results.array()

        if (errors.length > 0) {

            res.render('admin/add_product', {
                errors,
                title,
                price,
                description,
                categories

            })

        } else {

            price = parseFloat(price).toFixed(2);
            image = req.files.image.name;
            console.log(req)
            var product = new Product({
                title,
                price,
                slug,
                description,
                category,
                image
            });

            product.save()
                .then((productResult) => {
                    console.log(productResult._id);
                    console.log('data is to be saved succesfully');

                    var dir1 = 'public/product_image/' + product._id;
                    var dir2 = newPath.join(dir1, 'gallery');

                    var dir3 = newPath.join(dir2, 'thumbs');
                    mkDirp(dir1)
                        .then((made) => {

                            var newPath = made + "/" + image
                            console.log(newPath)

                            req.files.image.mv(newPath, (err) => {
                                if (err)
                                    return console.log(err);

                            })

                        })
                    mkdirp(dir2);
                    mkdirp(dir3);

                    req.flash('succes', 'product is successfully added');
                    res.redirect('/admin/products');
                })
                .catch((err) => {
                    console.log('error occured in the mongodb database' + err);
                })
        }
    });




router.post('/edit-product/:id', body('title', 'Title Must Have a Value').notEmpty(), body('description', 'Description Must Have a Value').notEmpty(),
    body('price', 'price must have a value').isDecimal(),
    body('image', 'must fill the jpg,jpeg,png files ').custom((value, { req, path, location }) => {


        function isValidName(e) {
            return (/\.(png|bmp|jpe?g|jfif)/i).test(e);
        };

        return isValidName(req.files.image.name)
    }), async(req, res) => {


        let id = req.params.id;
        let title = req.body.title !== "" ? req.body.title : "";
        let description = req.body.description != "" ? req.body.description : "";
        let category = req.body.category != "" ? req.body.category : "";
        let price = req.body.price != "" ? req.body.price : "";
        let slug = title.replace(/\s+/g, '-');

        let image = "";
        let categories = await Categroy.find({});
        var results = validationResult(req);
        var errors = results.array()

        if (errors.length > 0) {
            res.redirect('/admin/products/edit-product/' + id);
        } else {

            price = parseFloat(price).toFixed(2);
            image = req.files.image.name;

            Product.findByIdAndUpdate(id, {
                title,
                price,
                image,
                description,
                slug,
                category
            }).then((updatedProduct) => {
                console.log('successfully uploaded to the database')
                console.log(updatedProduct);


                var directoryPath = 'public/product_image/' + id;
                var filePath = newPath.join(directoryPath, image);
                req.files.image.mv(filePath, function(err) {
                    if (err)
                        return console.log(err);

                    console.log('file is upDated  succesfullyyyy');
                })


                req.flash('success', 'succesfully added to the database')
                res.redirect('/admin/products')
            }).catch(err => {
                console.log(err);
            })




        }









    });



router.post('/product-gallery/:id', (req, res) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_image/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/product_image/' + id + '/gallery/thumbs/' + req.files.file.name;


    productImage.mv(path, function(err) {
        if (err) { console.log(err) } else {
            console.log('successfully saved in the database');

            resizeimage(fs.readFileSync(path), {
                    width: 100,
                    height: 100
                }).then((buff) => {

                    fs.writeFileSync(thumbsPath, buff);
                    console.log('writing to the ' + thumbsPath + 'ís successfull');
                    res.sendStatus(200);
                })
                .catch(err => {
                    console.log(err);


                })

        }

    })




})


router.get('/delete-image/:imgname', (req, res) => {
    // you are deleting the image for the particular id 
    // which is send through query string 
    var id = req.query.id;
    var imageName = req.params.imgname;


    let imagepath = 'public/product_image/' + id + '/gallery/' + imageName;
    let thumbsPath = `public/product_image/${id}/gallery/thumbs/${imageName}`;

    fs.rm(imagepath, (err, suc) => {
        if (err) {
            console.log(`this error is occured during the removing the image from the application server ${imagepath} directory`);
            console.log(err)
        } else {
            fs.rm(thumbsPath, (err, suc) => {
                if (err)
                    console.log(`this error is occured during the removieng of the image for the ${thumbsPath} directory`);
                else {
                    console.log(`succesfullly deleted the image in the application server `);

                    req.flash('success', 'image deleted succesfully');
                    res.redirect('/admin/products/edit-product/' + id);

                }
            })
        }
    });





})



module.exports = router;