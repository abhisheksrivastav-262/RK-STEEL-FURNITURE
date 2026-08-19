module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.STRING, allowNull: false },
    oldPrice: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
    sku: { type: DataTypes.STRING },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.STRING }, // Main image URL/filename
    additionalImages: { type: DataTypes.TEXT }, // JSON array string
    specs: { type: DataTypes.TEXT },   // JSON array of { key, value } objects
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.ENUM('published', 'draft', 'hidden'), defaultValue: 'published' },
    order: { type: DataTypes.INTEGER, defaultValue: 0 },
    whatsappMsg: { type: DataTypes.TEXT }
  });
  return Product;
};
