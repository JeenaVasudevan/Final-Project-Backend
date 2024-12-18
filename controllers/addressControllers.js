import { Address } from "../models/addressModel.js";

export const addOrUpdateAddress = async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const { fullName, phone, street, city, state,zipCode } = req.body;
      if (!fullName || !phone || !street || !city || !state || !zipCode) {
        return res.status(400).json({ message: "All fields are required." });
      }
      const existingAddress = await Address.findOne({ user: req.user.id });
  
      if (existingAddress) {
        existingAddress.fullName = fullName;
        existingAddress.phone = phone;
        existingAddress.street = street;
        existingAddress.city = city;
        existingAddress.state = state;
        existingAddress.zipCode = zipCode;
        await existingAddress.save();
        return res.status(200).json({ message: "Address updated successfully", address: existingAddress });
      }
      const newAddress = new Address({
        user: req.user.id,
        fullName,
        phone,
        street,
        city,
        state,
        zipCode,
      });
  
      await newAddress.save();
      res.status(201).json({ message: "Address added successfully", address: newAddress });
  
    } catch (error) {
      console.error("Error saving/updating address:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
export const fetchUserAddress = async (req, res) => {
  try {
    const userAddress = await Address.findOne({ user: req.user.id });
    if (!userAddress) {
      return res.status(404).json({ message: "No address found for this user" });
    }
    res.status(200).json({ address: userAddress });
  } catch (error) {
    console.error("Error fetching address:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

