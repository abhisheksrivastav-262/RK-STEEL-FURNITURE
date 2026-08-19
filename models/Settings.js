module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    value: { type: DataTypes.TEXT } // Can be JSON string or simple text
  });
  return Settings;
};
