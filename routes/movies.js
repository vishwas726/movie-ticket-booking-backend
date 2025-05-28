import express from "express";
import Movie from "../models/Movie.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json({ success: true, data: movies });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    console.log(error);
  }
});

export default router;
