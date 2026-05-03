import { Contact } from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Contact submitted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};