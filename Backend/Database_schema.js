const Sequelize = require('sequelize');

const sequelize = require('../config/sequelize');

const Recipe = sequelize.define('Recipe', {
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
      model: 'Users',
      key: 'UserID',
    },
  },
  Cuisine: {
    type: Sequelize.STRING(50),
  },
});

const User = sequelize.define('Users', {
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
});

const Comment = sequelize.define('Comment', {
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
      model: 'Recipe',
      key: 'RecipeID',
    },
  },
  UserID: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'UserID',
    },
  },
});

const Rating = sequelize.define('Rating', {
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
});

const Favourites = sequelize.define('Favourites', {
  RecipeID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  UserID: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
});

module.exports = {
  Recipe,
  User,
  Comment,
  Rating,
  Favourites
};