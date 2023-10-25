//Password and username is the same but in lowercase
//10rounds

const express = require('express');
const app = express();
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
  port:8111
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
    UserId: {
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
  },{
    timestamps:false,
  });
  
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
    timestamps:false
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
    timestamps:false
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
app.post('/login', async (req, res) => {
  const { username,password } = req.body;
  console.log(req.body)
  const user = await User.findOne({ where: { Username:username } });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  const passwordValid = await bcrypt.compare(password, user.Password);
  if (!passwordValid) {
    return res.status(401).json({ message: 'Incorrect password.' });
  }
  req.session.user = {
    username,
  };
  res.cookie('session', req.sessionID);
  res.json({ message: 'Login successful!' });
});

//Logout route.
app.post('/logout',authenticationMiddleware,async (req, res) => {
  req.session.destroy();
  // Clear the user's browser cache.
  res.clearCookie('session');
  res.json({ message: 'Successfully LoggedOut!' });
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});