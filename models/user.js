module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING
  }, {});
  
  User.associate = function(models) {
    User.hasMany(models.Image, { foreignKey: 'userId' });
    User.hasMany(models.Rating, { foreignKey: 'userId' });
  };

  return User;
};
