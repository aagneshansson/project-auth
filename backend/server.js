import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from "crypto";
import bcrypt from 'bcrypt';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/authAPI"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      minLength: 5
    }, 
    password: { 
      type: String,
      required: true,
      minLength: 5
    },
    accessToken: {
      type: String,
      default: () => crypto.randomBytes(128).toString('hex'),
      unique: true,
    },
});

userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  const salt = bcrypt.genSaltSync(); // the number between () is for how much variation you want in the password 8
    console.log(`PRE SALT PASSWORD ${user.password}`)
  user.password = bcrypt.hashSync(user.password, salt)
    console.log(`PAST SALT PASSWORD ${user.password}`)

  //Continue with save
  next();
});

const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.header('Authorization');
    const user = await User.findOne({ accessToken });
      if (!user) {
        throw 'User not found';
      }
    req.user = user; 
  } catch (err) {
    const errorMessage = "Login failed, please try again!";
  console.log('AuthenticateUser function')
  res.status(401).json({ error: errorMessage });
  }
  next();
};

const User = mongoose.model('User', userSchema);

//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

                // const authenticateUser = async (req, res, next) => {
                //   next();
                // };

// Start defining your routes here
app.get('/', (req, res) => {
  res.send('Hi, welcome to our server')
});

// Create user - sign up
app.post("/users", async (req, res) => {
  try {
    const { name, password } = req.body;
      console.log(`Name: ${name}`);
      console.log(`Password: ${password}`);
    const user = await new User({
      name,
      password,
    }).save();
    res.status(200).json({ userId: user._id, accessToken: user.accessToken });
  } catch (err) {
    res.status(400).json({ message: 'Could not create user', errors: err });
  }
});

// Login user
app.post("/sessions", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });

    if (user && bcrypt.compareSync(password, user.password)) {
      //Compare passwords
      res.status(200).json({ userId: user._id, accessToken: user.accessToken });
    } else { 
      throw 'User not found';
    }
  } catch (err) { 
    res.status(404).json({ error: 'User not found' });
  }
});

app.get('/secret', authenticateUser);
app.get('/secret/', async (req, res) => {
  const secretMessage = `This is a secret message for ${req.user.name}`;
  res.status(200).json({ secretMessage });
});

// Secure endpoint, user needs to be logged in to access this 

// app.get('/users/:id/profile', authenticateUser); 
// app.get('/users/:id/profile', async (req, res) => {
//     console.log('GET /user/:id/profile handler');
//     console.log(`${req.user.name} authenticated`);

//   const user = await User.findOne({ _id: req.params.id });
//   const privateProfileMessage = `Hi ${user.name}! Welcome to our site`;
//   const publicProfileMessage = `This is a public message.`;

//     console.log(`Authenticated user._id: ${req.user._id}`)
//     console.log(`Requested user._id: ${user._id}`)

//   // Decide private or public here
//   if (req.user._id.$oid == user._id.$oid) {
//     //Private information
//     res.status(200).json({ profileMessage: privateProfileMessage });
//   } else {
//     //Public information
//     res.status(200).json({ profileMessage: publicProfileMessage });
//   }
//});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
});
