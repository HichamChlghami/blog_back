// const mongoose = require('mongoose')
// const schema = mongoose.Schema(
//     {
//         titles: [String],
//         descriptions: [String],
//         images: [String],
        
//     }, { timestamps: true }
// );

// const New = mongoose.model("achieve",schema)
// module.exports= New

const mongoose = require('mongoose');

const itemSchema = mongoose.Schema(
    {
 
      type: String,
      value: String,
    },
    { _id: false }


);

const postSchema = mongoose.Schema(
  {
    content: [itemSchema],
  },
  { timestamps: true }
  
);

const Post = mongoose.model('back', postSchema);

module.exports = Post;

