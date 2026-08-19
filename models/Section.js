module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    sectionId: { type: DataTypes.STRING, unique: true, allowNull: false }, // e.g. 'hero', 'about'
    name: { type: DataTypes.STRING, allowNull: false },
    isVisible: { type: DataTypes.BOOLEAN, defaultValue: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    content: { type: DataTypes.TEXT } // JSON string holding dynamic text/image refs
  });
  return Section;
};
