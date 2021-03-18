const Category = require('../models/category');
const routes = require('express').Router();
const { body, validationResult } = require('express-validator');

routes.get('/', (req, res) => {
    Category.find({})
        .then(Categories => {


            res.render('admin/categories', {
                Categories
            })

        })
        .catch(err => {
            console.log('error due to category')
            console.log(err)
        })

});


routes.get('/add-category', (req, res) => {

    var title = "";

    res.render('admin/add_category', { title })

})


routes.post('/add-category', body('title', 'Title must have a value')
    .notEmpty(), (req, res) => {


        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-');

        let results = validationResult(req);
        let errors = results.array();
        if (!results.isEmpty()) {
            res.render('admin/add_category', {
                errors,
                title
            });
        }


        Category.findOne({ slug })
            .then(category => {
                if (category) {
                    req.flash('danger', 'Category Title exist Choose Another Category');
                    res.render('admin/add_category', {
                        title

                    })
                } else {
                    var NewCategory = new Category({ title, slug })
                    NewCategory.save().then(data => {

                            req.flash('Success', 'Category  Added Successfully');
                            res.redirect('/admin/categories')
                        })
                        .catch(
                            (err) => { console.log(` ${err} is occured when saving the data`) }
                        );
                }

            })
            .catch(err => { console.log(err) })


    })


routes.get('/edit-category/:id', (req, res) => {
    Category.findById(req.params.id, (err, category) => {
        if (err) { console.log(err) } else {
            res.render('admin/edit_category', {
                title: category.title,
                id: category._id
            })
        }


    })

})

routes.post('/edit-category/', body('title', 'Title must have a value')
    .notEmpty(), (req, res) => {

        var title = req.body.title;
        var slug = title.replace(/\s+/g, '-');
        var id = req.body.id;

        let results = validationResult(req);
        let errors = results.array();

        if (!results.isEmpty()) {
            res.render('admin/edit_category', {
                errors,
                title
            });
        } else {

            Category.findByIdAndUpdate(id, {
                    title,
                    slug
                }).then(() => {

                    req.flash('Success', 'Category  Added Successfully');
                    res.redirect('/admin/categories')
                })
                .catch(err => {
                    console.log(err)
                })

        }


    })

routes.get('/delete-category/:id', (req, res) => {

    Category.findByIdAndRemove(req.params.id)
        .then(() => {
            req.flash('succes', 'succesfully Deleted');
            res.redirect('/admin/categories');
        })
        .catch(err => { console.log(err) });
})
module.exports = routes;