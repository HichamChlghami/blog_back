


const express = require('express');
const app = express();
const db = require('./database/db');
const multer = require('multer');
const Post = require('./models/post');
const Users = require('./models/users');
const bcrypt = require('bcrypt')

const path = require('path');
const cors = require('cors');
const fs = require('fs');
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../blog_front/public')));
app.use(cors());

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../blog_front/public'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Database connection
db();





app.post('/write', upload.array('files'), async (req, res) => {
  try {
    const  {content}  = req.body;

    const parsedContent = JSON.parse(content);





    


    const formattedContent = [];
    let imageIndex = 0;
    
    parsedContent.forEach(item => {
      if (item.type === 'image' || item.type === 'filePdf' ) {
        if (req.files.length > imageIndex) {
          formattedContent.push({
            type: item.type,
            value: req.files[imageIndex].filename,
          });
          imageIndex++;
        }
      } else {
        formattedContent.push({
          type: item.type,
          value: String(item.value), // Ensure the value is cast to a string
        });
      }
    });



    






//     const images = req.files.map(file => file.filename);
// console.log(images)
// console.log('hicham')


    const post = new Post({
      content: formattedContent,
      // images: images,
    });

    await post.save();
    console.log(post);
    res.status(200).send('Post created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating post');
  }
});

app.get('/get', async (req, res) => {
  try {
    const get = await Post.find();
    res.status(200).json(get);
    console.log(get)
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});



app.get("/get/:id" , async(req,res)=>{
  try {
    const data = await Post.findById(req.params.id)
    res.status(200).json(data)
  } catch (error) {
    console.log(`errorr is ${error}`)
  }
})



// Get related posts for a given post ID based on text and category
app.get('/get/:id/related', async (req, res) => {
  try {
    // Find the current post
    const currentPost = await Post.findById(req.params.id);

    if (!currentPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Find the category and text of the current post
    const category = currentPost.content.find(item => item.type === 'category')?.value;
    const text = currentPost.content.find(item => item.type === 'text')?.value;

    // Find all related posts with the same category or similar text
    if (category || text) {
      const relatedPosts = await Post.find({
        $or: [
          { 'content.type': 'category', 'content.value': category },
          { 'content.type': 'text', 'content.value': { $regex: text, $options: 'i' } },
        ],
        '_id': { $ne: req.params.id }, // Exclude the current post from results
      });

      res.status(200).json(relatedPosts);
    } else {
      res.status(404).json({ error: 'Category or text not found for the current post' });
    }
  } catch (error) {
    console.error(`Error fetching related posts: ${error}`);
    res.status(500).json({ error: 'Error fetching related posts' });
  }
});


//UPDATE POST
app.put('/update/:id', upload.array('files'), async (req, res) => {
  try {
    const { content } = req.body;
    const parsedContent = JSON.parse(content);

    let imageIndex = 0; // Use let instead of const

    const formattedContent = parsedContent.map((item) => {
      if ((item.type === 'image' || item.type === 'filePdf') && typeof item.value === 'object'  && req.files.length > imageIndex) {
        const updatedItem = {
          ...item,
          value: req.files[imageIndex].filename,
        };
        imageIndex++;
        return updatedItem;
      }
      return item;
    });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: { content: formattedContent } },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating post' });
  }
});


  
// DELETE POST endpoint
app.delete("/delete/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json("Post not found");
    }

    // Extract filenames or identifiers of images + files associated with the post
    const filesToDelete = post.content
      .filter(item => item.type === 'image' || item.type === 'filePdf' )
      .map(item => item.value); // Array of filenames or identifiers

    // Delete the post from the database
    await Post.findByIdAndDelete(req.params.id);

    // Delete associated files + images 
    filesToDelete.forEach(imageFileName => {
      const imagePath = path.join(__dirname, '../blog_front/public', imageFileName);

      // Use fs.unlink to delete the image file
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${imageFileName}: ${err}`);
          // Handle the error accordingly
        } else {
          console.log(`File ${imageFileName} has been deleted`);
        }
      });
    });

    res.status(200).json("Post and associated images have been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// Hnadle post for users 
app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(user.password , salt)



    const newUser = new Users({
      fullname: user.fullname,
      email: user.email,
      password: hashPass,
      destination: user.destination
    });
    await newUser.save();
    res.status(201).json(newUser); // Sending back the newly created user
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === 'agnecy@webhived.com' && password === 'Saad9Hicham') {
    // Admin login
    return res.status(200).json({ message: 'Admin login successful' });
  }

  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(400).json({ error: 'Email not registered' });
  }

    // Compare the hashed password with the provided password (assuming secure storage and comparison)

  const validated = await bcrypt.compare(password , user.password)
  if (!validated) {
    return res.status(400).json({ error: 'Incorrect password' });
  }

  // Regular user login
  return res.status(200).json({ message: 'User login successful' });
});



app.get('/search', async (req, res) => {
  const { query } = req.query; // Change from req.query.word to req.query.query
  try {
    // Use regular expression for case-insensitive search
    const posts = await Post.find({
      'content.type': 'title1',
      'content.value': { $regex: new RegExp(query, 'i') },
    });

    res.json({ success: true, posts });
    console.log(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});





// Routes
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
