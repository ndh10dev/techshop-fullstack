import { Review } from "../models/Review.js";

export async function listReviews(req, res, next) {
  try {
    const reviews = await Review.findAll({
      attributes: ["id", "customerName", "rating", "comment", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const { customerName, rating, comment } = req.body;

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const review = await Review.create({
      customerName,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}