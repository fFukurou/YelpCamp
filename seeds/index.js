const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log(`Database Connected`);
});


const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
          // MY/YOUR USER ID
            author: '67f81ac2501f5f223e54f6e5',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse officia, laboriosam rem necessitatibus autem accusamus nihil nulla delectus, eligendi aspernatur, sunt iste debitis ab velit! Libero voluptatem id facere! Fuga?',
            price: price,
            geometry: {
              type: "Point",
              coordinates: [-113.1331, 47.0202]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dw4c91yov/image/upload/v1744472796/YelpCamp/jwzweum4nhqtb55kf9de.jpg',
                  filename: 'YelpCamp/jwzweum4nhqtb55kf9de',
                },
                {
                  url: 'https://res.cloudinary.com/dw4c91yov/image/upload/v1744472798/YelpCamp/jhuroakkyrl5xojpnujq.png',
                  filename: 'YelpCamp/jhuroakkyrl5xojpnujq',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})