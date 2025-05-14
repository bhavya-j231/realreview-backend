module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    filePath: DataTypes.STRING,
    location: DataTypes.STRING,
    timestamp: DataTypes.DATE,
    status: DataTypes.STRING, // pending, approved, archived
    userId: DataTypes.INTEGER
  }, {});
  
  Image.associate = function(models) {
    Image.belongsTo(models.User, { foreignKey: 'userId' });
    Image.hasMany(models.Rating, { foreignKey: 'imageId' });
  };

  return Image;
};
