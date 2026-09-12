const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopName: { type: String, required: true },
    shopMobile: { type: String, required: true },
    shopAddress: { type: String, required: true },
    mapLink: { type: String, default: '' },
    orderDate: { type: String, required: true },
    deliveryDate: { type: String, required: true },
    products: { type: [productSchema], required: true },
    totalItems: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
