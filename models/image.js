// models/image.js


module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'archived'),
      defaultValue: 'pending'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exifData: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    archiveDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    locationValidated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCreate: async (image) => {
        // Set archive date to 30 days from now, if not already set
        if (!image.archiveDate) {
          image.archiveDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      }
    }
  });

  Image.associate = function(models) {
    Image.belongsTo(models.User, { foreignKey: 'userId' });
    Image.hasMany(models.Rating, { foreignKey: 'imageId' });
  };

  return Image;
};
