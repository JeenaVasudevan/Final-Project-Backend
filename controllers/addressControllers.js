import { Address } from "../models/addressModel.js";


// Controller to add or update address
export const addOrUpdateAddress = async (req, res) => {
    try {
      // Ensure the user is authenticated (check if req.user.id exists)
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }
  
      const { fullName, phone, street, city, state, country, zipCode } = req.body;
  
      // Validate the input data
      if (!fullName || !phone || !street || !city || !state || !zipCode) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Check if the user already has an address
      const existingAddress = await Address.findOne({ user: req.user.id });
  
      if (existingAddress) {
        // Update existing address
        existingAddress.fullName = fullName;
        existingAddress.phone = phone;
        existingAddress.street = street;
        existingAddress.city = city;
        existingAddress.state = state;
        existingAddress.zipCode = zipCode;
        await existingAddress.save();
        return res.status(200).json({ message: "Address updated successfully", address: existingAddress });
      }
  
      // If no existing address, create a new one
      const newAddress = new Address({
        user: req.user.id, // Link the address to the authenticated user
        fullName,
        phone,
        street,
        city,
        state,
        zipCode,
      });
  
      await newAddress.save(); // Save the address to the database
      res.status(201).json({ message: "Address added successfully", address: newAddress });
  
    } catch (error) {
      console.error("Error saving/updating address:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  };
// Controller to fetch user address
export const fetchUserAddress = async (req, res) => {
  try {
    // Fetch the user's address from the database
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

