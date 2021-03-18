const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    title: {

    },
    slug: {

    },
    content: {

    }

});

module.exports = mongoose.model('Category', CategorySchema);