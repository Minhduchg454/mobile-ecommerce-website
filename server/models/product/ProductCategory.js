const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productCategorySchema = new mongoose.Schema({
    productCategoryName: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

productCategorySchema.set('toJSON', {
    versionKey: false
})

//Export the model
module.exports = mongoose.model('ProductCategory', productCategorySchema);