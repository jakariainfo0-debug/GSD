const Order = require('../Models/OrderModel');

// ---------------- CREATE ORDER ----------------
const createOrder = async (req, res) => {
  try {
    const {
      shopName,
      shopMobile,
      shopAddress,
      mapLink,
      orderDate,
      deliveryDate,
      products,
      totalItems,
      totalAmount,
    } = req.body;

    // Validation
    if (!shopName || !shopMobile || !shopAddress) {
      return res.status(400).json({ message: 'Shop info is required' });
    }

    if (!orderDate || !deliveryDate) {
      return res
        .status(400)
        .json({ message: 'Order & delivery date required' });
    }

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one product is required' });
    }

    const newOrder = await Order.create({
      user: req.user.id, // auth middleware theke asbe
      shopName,
      shopMobile,
      shopAddress,
      mapLink: mapLink || '',
      orderDate,
      deliveryDate,
      products,
      totalItems,
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ALL ORDERS (logged-in user) ----------------
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- GET SINGLE ORDER ----------------
const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE ORDER ----------------
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- DELETE ORDER ----------------
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
};
