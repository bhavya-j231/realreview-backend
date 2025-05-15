const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/*module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  
  User.associate = function(models) {
    User.hasMany(models.Image, { foreignKey: 'userId' });
    User.hasMany(models.Rating, { foreignKey: 'userId' });
  };

  return User;
};*/

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 8);
        }
      }
    }
  });
  
  User.associate = function(models) {
    User.hasMany(models.Image, { foreignKey: 'userId' });
    User.hasMany(models.Rating, { foreignKey: 'userId' });
  };

  // Instance method to generate auth token
  User.prototype.generateAuthToken = function() {
    return jwt.sign(
      { id: this.id, isAdmin: this.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  };

  // Instance method to check password
  User.prototype.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};

