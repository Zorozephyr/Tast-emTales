//Password and username is the same but in lowercase
//10rounds
const path = require('path'); // Import the path module
const fs = require('fs');
// Serve static files from the "frontend" directory

const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, '..', 'Frontend')));
const port = process.env.PORT || 3000;
const expressSession = require('express-session');
const bcrypt = require('bcrypt');
const sessionMiddleware = expressSession({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60,
  },
});

// Middleware for parsing JSON and URL-encoded data (if using body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);

"MiddleWare to check authentication"
const authenticationMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

////////////////////////////////////
const Sequelize = require('sequelize');

const sequelize = new Sequelize('tastetales', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port:3306
});

const Recipe = sequelize.define('recipe', {
    RecipeID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Title: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    Ingredients: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    HowToCook: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    UserID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'UserID',
      },
    },
    Cuisine: {
      type: Sequelize.STRING(50),
    },
  },{
    tableName:'recipe',
    timestamps:false
  });
  
  const User = sequelize.define('users', {
    UserID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Username: {
      type: Sequelize.STRING(50),
      allowNull: false,
    },
    Email: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    Password: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
  },{
    timestamps:false
  });
  
  const Comment = sequelize.define('comment', {
    CommentID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    CommentText: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    RecipeID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'recipe',
        key: 'RecipeID',
      },
    },
    UserID: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'UserID',
      },
    },
  }, {
    timestamps: false,
    tableName: 'comment',
  });
  
  Comment.belongsTo(User, { as: 'users', foreignKey: 'UserID' });
  

  const Rating = sequelize.define('rating', {
    RecipeID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    UserID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    Rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },{
    timestamps:false,
    tableName:'rating',
  });
  
  const Favourites = sequelize.define('favourites', {
    RecipeID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    UserID: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
  },{
    timestamps:false,
    tableName:'favourites',
  });

///////////////////////////////////////


sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to the database!');
  })
  .catch((err) => {
    console.log('Failed to connect to the database:', err);
  });

///////////////////////////////////////////////////////////
//Start of Routes

//Login checks for username and email
app.get('/', (req, res) => {
  // Send the login.html file as the response
  res.sendFile(path.join(__dirname, '..', 'Frontend', 'home.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  
  try {
      const user = await User.findOne({ where: { Username: username } });
      
      if (!user) {
          // User not found, render the login page with an error message
          return res.status(200).sendFile(path.join(__dirname, '..', 'Frontend', 'login-error-user-not-found.html'));
      }

      const passwordValid = await bcrypt.compare(password, user.Password);
      
      if (!passwordValid) {
          // Incorrect password, render the login page with an error message
          return res.status(200).sendFile(path.join(__dirname, '..', 'Frontend', 'login-error-incorrect-password.html'));
      }

      req.session.user = {
          username,
          userID: user.UserID,
      };
      
      res.cookie('session', req.sessionID);
      const successHtml = fs.readFileSync(path.join(__dirname, '..', 'Frontend', 'user-profile.html'), 'utf8');

        // Replace the placeholder with the username
        const updatedHtml = successHtml.replace('<span id="usernamePlaceholder"></span>', user.Username);

        // Send the updated HTML to the client
        res.status(200).send(updatedHtml);
  } catch (error) {
      console.error('Error during login:', error);
      // Handle the error or return an error response
      return res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if a user with the same username or email already exists
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [{ Username: username }, { Email: email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await User.create({
      Username: username,
      Email: email,
      Password: hashedPassword,
    });

    // Log in the new user (you can customize this part according to your authentication flow)
    req.session.user = {
      username,
      userID: newUser.UserID,
    };

    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Error registering a new user:', error);
    res.status(500).json({ message: 'Failed to register a new user' });
  }
});

//Logout route.
app.all('/logout',authenticationMiddleware,async (req, res) => {
  req.session.destroy();
  // Clear the user's browser cache.
  res.clearCookie('session');
  res.redirect('/')
});

//Recipe Search
app.post('/search', async (req, res) => {
  // Parse the request body to get the searchSentence.
  let { searchSentence,cuisine } = req.body;
  if(!searchSentence){
    searchSentence="";
  }
  // Split the searchSentence into individual words.
  const searchWords = searchSentence.split(' ');

  // Create a WHERE clause for the query.
  const searchConditions = searchWords.map(searchWord => ({
    [Sequelize.Op.or]: [
      {
        Title: {
          [Sequelize.Op.like]: `%${searchWord}%`,
        },
      },
      {
        Ingredients: {
          [Sequelize.Op.like]: `%${searchWord}%`,
        },
      },
      {
        HowToCook: {
          [Sequelize.Op.like]: `%${searchWord}%`,
        },
      },
    ],
  }));

  const whereClause = {
    [Sequelize.Op.and]: searchConditions,
  };

  if (cuisine) {
    whereClause[Sequelize.Op.and] = [
      whereClause[Sequelize.Op.and],
      {
        Cuisine: {
          [Sequelize.Op.like]: `%${cuisine}%`,
        },
      },
    ];
  }

  // Execute the query and return the results to the client.
  const recipes = await Recipe.findAll({ where: whereClause });
  res.json(recipes);
});

//Post New Recipe
app.post('/recipe',authenticationMiddleware,async (req, res) => {
  const {Title,Ingredients,HowToCook,Cuisine}=req.body;
  if(!Title|!Ingredients|!HowToCook|!Cuisine){
    return res.status(400).json({message:"All fields are required"});
  }
  const UserID=req.session.user.userID;
  
  try{
    //Create The new recipe in the database
    const newRecipe=await Recipe.create({
      Title,Ingredients,HowToCook,Cuisine,UserID
    });
    res.redirect('/recipe.html?success=true');
  }
  catch(error){
    console.error('Error creating a new recipe:', error);
    res.status(500).json({ message: 'Failed to create a new recipe' });
  }
});

//Edit or Update a Recipe
app.put('/recipe/:RecipeID',authenticationMiddleware,async (req, res) => {
  const {RecipeID}=req.params;
  const {Title,Ingredients,HowToCook,Cuisine}=req.body;
  const userID = req.session.user.userID;

  try {
    // Check if the recipe with the given recipeId exists and is associated with the logged-in user
    const recipe = await Recipe.findOne({ where: { RecipeID: RecipeID, UserID: userID } });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized to edit.' });
    }

    // Update the recipe with the new data
    if(Title){
      recipe.Title = Title;
    }
    if(Ingredients){
      recipe.Ingredients = Ingredients;
    }
    if(HowToCook){
      recipe.HowToCook = HowToCook;
    }
    if(Cuisine){
      recipe.Cuisine = Cuisine;
    }

    // Save the updated recipe
    await recipe.save();

    res.json({ message: 'Recipe updated successfully', recipe });
  } catch (error) {
    console.error('Error updating the recipe:', error);
    res.status(500).json({ message: 'Failed to update the recipe' });
  }
});

// Delete a recipe
app.delete('/recipe/:RecipeID', authenticationMiddleware, async (req, res) => {
  const { RecipeID } = req.params;
  const userID = req.session.user.userID; // Assuming you have user authentication in place

  try {
    // Check if the recipe with the given recipeId exists and is associated with the logged-in user
    const recipe = await Recipe.findOne({ where: { RecipeID: RecipeID, UserID: userID } });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized to delete.' });
    }

    // Delete the recipe from the database
    await recipe.destroy();

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting the recipe:', error);
    res.status(500).json({ message: 'Failed to delete the recipe' });
  }
});

//Get a particular recipe for show page
app.get('/recipe/:RecipeID',async(req, res) => {
  const { RecipeID } = req.params;
  try {
    // Find the recipe with the given RecipeID and include the associated user (if any)
    const recipe = await Recipe.findOne({
      where: { RecipeID: RecipeID },
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    const user=await User.findOne({
      where:{UserID:recipe.UserID}
    });

    res.json({...recipe.dataValues,Username:user.Username});
  } catch (error) {
    console.error('Error retrieving the recipe:', error);
    res.status(500).json({ message: 'Failed to retrieve the recipe' });
  }
});

// Retrieve all comments for a specific recipe by RecipeID and include the associated usernames
app.get('/comments/:RecipeID', async (req, res) => {
  const { RecipeID } = req.params;

  try {
    // Find all comments for the given RecipeID and include the associated user's username
    const comments = await Comment.findAll({
      where: { RecipeID: RecipeID },
      include: [
        {
          model: User,
          as: 'users', // Alias for the User model
          attributes: ['Username'], // Include only the 'Username' field from the User model
        },
      ],
    });

    const processedComments = comments.map(comment => ({
      CommentID: comment.CommentID,
      CommentText: comment.CommentText,
      RecipeID: comment.RecipeID,
      UserID: comment.UserID,
      Username: comment.users.Username,
    }));

    res.json(processedComments);
  } catch (error) {
    console.error('Error retrieving comments:', error);
    res.status(500).json({ message: 'Failed to retrieve comments' });
  }
});

//Post new comment 
app.post('/comment/:RecipeID',authenticationMiddleware,async (req, res) => {
  const {CommentText}=req.body;
  const {RecipeID}=req.params;
  const UserID= req.session.user.userID; 
  if(!CommentText){
    return res.status(400).json({message:"Comment Is Empty"});
  }

  try{
    const newComment=await Comment.create({
      CommentText,RecipeID,UserID
    })
    res.status(201).json(newComment);
  }
  catch(error){
    console.error('Error creating a new comment:', error);
    res.status(500).json({ message: 'Failed to create a new comment' });
  }
});

//Get avg rating for a recipe
app.get('/rating/:RecipeID', async (req, res) => {
  const { RecipeID } = req.params;

  try {
    // Calculate the average rating for the given RecipeID
    const averageRating = await Rating.findOne({
      where: { RecipeID: RecipeID },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('Rating')), 'averageRating'],
      ],
    });

    if (averageRating && averageRating.dataValues.averageRating) {
      res.json({ averageRating: averageRating.dataValues.averageRating });
    } else {
      res.json({ averageRating: 0 }); // Return 0 if there are no ratings
    }
  } catch (error) {
    console.error('Error retrieving average rating:', error);
    res.status(500).json({ message: 'Failed to retrieve average rating' });
  }
});

app.post('/rating/:RecipeID', authenticationMiddleware, async (req, res) => {
  const UserID = req.session.user.userID;
  const { ReqRating } = req.body;
  const { RecipeID } = req.params;

  if (!Rating) {
    return res.status(400).json({ message: 'Rating is required in the request body' });
  }

  try {
    // Check if the user has already rated this recipe
    const existingRating = await Rating.findOne({
      where: { RecipeID:RecipeID, UserID:UserID },
    });

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this recipe' });
    }

    // Create a new rating for the recipe
    const newRating = await Rating.create({
      RecipeID,
      UserID,
      Rating: parseInt(ReqRating), // Assuming Rating is an integer
    });

    res.status(201).json(newRating);
  } catch (error) {
    console.error('Error posting a new rating:', error);
    res.status(500).json({ message: 'Failed to post a new rating' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});