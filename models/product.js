const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String

    },
    category: {
        type: String
    },

    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }

})

module.exports = mongoose.model("product", productSchema);