const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have maximum 40 characters'],
      //validate: [validator.isAlpha, 'Tour name can contain only letters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
      min: [5, "A tour group must consist of minimum 5 PAX"],
      max: [30, "A tour group must consist ot maximum 30 PAX"]
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Tour difficulty should be either easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "A rating must have ratings over 1"],
      max: [5, "Ratings cannot be higher than 5"],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      // we can use "this" only if we are creating NEW document
      validate: function(val) {
        return val < this.price;
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    description: String,
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    /* reviews: [
      { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Review' 
      }
    ], */
   //guides: Array
   guides: [
    {
     type: mongoose.Schema.ObjectId,
     ref: "User"
    }
   ]
  }, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  })

//tourSchema.index({price: 1});

//create compound index
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({ 'startLocation.coordinates': '2dsphere' });

// DOCUMENT MIDDLEWARE
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true});
  next();
});

/* tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id=> await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
}) */

//QUERY MIDDLEWARE

/* tourSchema.pre(/^find/, function(next){
  this.match({secretTour: { $ne: true }})
  next();
}) */

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
})

//AGGREGATION MIDDLEWARE
/* tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ '$match': { secretTour: { $ne: true } } });
  //console.log(this.pipeline())
  this.find({secretTour: { $ne: true }});
  next();
})
 */
  
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;