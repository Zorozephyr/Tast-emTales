const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data (if using body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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


app.get('/',async (req, res) => {
    const users = await User.findAll();
      
    res.json(users);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});