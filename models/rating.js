module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    score: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    imageId: DataTypes.INTEGER
  }, {});
  
  Rating.associate = function(models) {
    Rating.belongsTo(models.User, { foreignKey: 'userId' });
    Rating.belongsTo(models.Image, { foreignKey: 'imageId' });
  };

  return Rating;
};
