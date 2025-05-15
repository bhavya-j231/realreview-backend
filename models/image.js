/*module.exports = (sequelize, DataTypes) => {
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
};*/

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
    }
  }, {
    hooks: {
      beforeCreate: async (image) => {
        // Set archive date to 30 days from now
        image.archiveDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
      }
    }
  });
  
  Image.associate = function(models) {
    Image.belongsTo(models.User, { foreignKey: 'userId' });
    Image.hasMany(models.Rating, { foreignKey: 'imageId' });
  };

  return Image;
};

