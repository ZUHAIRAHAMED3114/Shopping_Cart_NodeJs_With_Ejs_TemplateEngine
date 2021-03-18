const router = require('express').Router();
const { resolveInclude } = require('ejs');
const { body, validationResult } = require('express-validator');
const Page = require('../models/page');


router.get('/test', (req, res) => {

    res.render('index', {
        title: 'admin front'
    })
})

router.get('/', (req, res) => {

    Page.find({})
        .sort({ sorting: 1 })
        .exec((err, pages) => {

            res.render('admin/pages', {
                pages
            })

        })

})

router.post('/reorder-page', (req, res) => {

    // peding 
    // the code to be wriited fro this page in the vide -14

})


router.get('/add-page', (req, res) => {
        let title = '';
        let slug = '';
        let content = '';

        res.render('admin/add_page', {
            title,
            slug,
            content
        });

    })
    /*
      posting the edit page
    */
router.post('/add-page', body('title', 'title must have a value').notEmpty(),
    body('content', 'content must have a value').notEmpty(), async(req, res) => {

        // validating the data comming from the req through body 

        let title = req.body.title;
        let slug = req.body.slug;
        let content = req.body.content;

        let validresult = validationResult(req);
        if (!validresult.isEmpty()) {
            res.render('admin/add_page', {
                errors: validresult.array(),
                title,
                slug,
                content
            });

        } else {

            // checking wheather the same slug data is there or not 
            var pageFromdatabase = await Page.findOne({
                slug
            })

            if (pageFromdatabase) {
                req.flash('danger', 'page slug exitst. so choose another')
                res.render('admin/add_page', {

                    title,
                    slug,
                    content
                });
            } else {

                // creating a new page instacne 
                var newPage = new Page({
                    title,
                    slug,
                    content,
                    sorting: 100
                })

                // after creating a page instance and then now saving to the database
                newPage.save()
                    .then(() => {
                        console.log('successfully saved to the data base')

                        req.flash('success', 'Page added Succesfully');
                        res.redirect('/admin/pages')

                    })
                    .catch(err => console.error(err))


            }


        }





    })




router.get('/edit-page/:slug', async(req, res) => {

    var pageData = await Page.findOne({ slug: req.params.slug })

    if (pageData) {
        res.render('admin/edit_page', {
            title: pageData.title,
            slug: pageData.slug,
            content: pageData.content,
            id: pageData._id
        })
    }



})
router.post('/edit-page/:slug', body('title', 'title must have a value').notEmpty(),
    body('content', 'content must have a value').notEmpty(), async(req, res) => {

        // validating the data comming from the req through body 

        let title = req.body.title;
        let slug = req.body.slug;
        let content = req.body.content;
        let id = req.body.id
        console.log(id);
        let validresult = validationResult(req);




        if (!validresult.isEmpty()) {
            res.render('admin/edit_page', {
                errors: validresult.array(),
                title,
                slug,
                content
            });

        } else {

            // checking wheather the same slug data is there or not 
            var pageFromdatabase = await Page.findById(id)
            console.log(pageFromdatabase)

            var updatedData = await Page.findByIdAndUpdate(id, {
                    title,
                    slug,
                    content
                })
                // after creating a page instance and then now saving to the database

            console.log(updatedData);

            req.flash('success', 'Page edited Succesfully');
            res.redirect('/admin/pages')

        }








    })

router.get('/delete-page/:id', async(req, res) => {
    var pageFromdatabase = await Page.findById(req.params.id)
    if (pageFromdatabase) {
        var result = await Page.findByIdAndRemove(req.params.id)
        req.flash('success', 'Page deleted Succesfully');
        res.redirect('/admin/pages')
    }

})
















module.exports = router;

/*
  in the post '/add-page' we observed i.e we added flash message 
  1) success
  2) danger
*/