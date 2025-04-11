const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const CampgroundSchema = new Schema ({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        // Delete all reviews where their ID is in our deleted document
        await Review.deleteMany({_id: {$in: doc.reviews}});
    }
})

module.exports =  mongoose.model('Campground', CampgroundSchema);