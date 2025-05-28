import express from "express";
import Booking from "../models/Booking.js";

import Movie from "../models/Movie.js";
import User from "../models/User.js";
import protectRoute from "../middleware/ProtectRoute.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("movieId");
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.log(error);
  }
});

router.get("/user", protectRoute, async (req, res) => {

  try {
    const userId = req.user;
   
    const user = await User.findById(userId).populate("bookings");

    console.log(user)



    res.json({ success: true, booking: user.bookings });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", protectRoute, async (req, res) => {
  try {
    const { movieId, seats } = req.body;
    const userId = req.user;

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Seats must be a non-empty array",
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // STEP 1: Remove expired locks (older than 5 mins)
    const now = Date.now();
    movie.lockedSeats = movie.lockedSeats.filter(
      (lock) => now - new Date(lock.lockedAt).getTime() < 5 * 60 * 1000
    );

    // STEP 2: Check for already booked seats
    const alreadyBooked = seats.some((seat) =>
      movie.bookedSeats.includes(seat)
    );
    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: "One or more seats are already booked",
      });
    }

    // STEP 3: Ensure seats are locked by this user
    const notLockedByUser = seats.some(
      (seat) =>
        !movie.lockedSeats.some(
          (lock) =>
            lock.seat === seat && lock.lockedBy.toString() === userId
        )
    );

    if (notLockedByUser) {
      return res.status(400).json({
        success: false,
        message: "Seats must be locked before booking",
      });
    }

    // STEP 4: Book seats & remove locks
    movie.bookedSeats.push(...seats);
    movie.lockedSeats = movie.lockedSeats.filter(
      (lock) => !seats.includes(lock.seat)
    );
    await movie.save();

    // STEP 5: Create booking
    const booking = new Booking({
      movieId,
      userId,
      seats,
    });
    await booking.save();

    await User.findByIdAndUpdate(userId, {
      $push: { bookings: booking._id },
    });

    res.status(201).json({
      success: true,
      message: "Seats booked successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});


router.get("/:id/seats", async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const totalSeats = movie.totalSeats;
    const bookedSeats = movie.bookedSeats;
    const availableSeats = [];

    for (let i = 1; i <= totalSeats; i++) {
      if (!bookedSeats.includes(i)) {
        availableSeats.push(i);
      }
    }

    res.json({
      totalSeats,
      bookedSeats,
      availableSeats,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching seat status", error: err.message });
  }
});


router.post("/lock", protectRoute, async (req, res) => {
  const { movieId, seats } = req.body;
  const userId = req.user;

  try {
    const movie = await Movie.findById(movieId);

    // Clear expired locks (e.g., older than 5 minutes)
    const now = Date.now();
    movie.lockedSeats = movie.lockedSeats.filter(
      (lock) => now - new Date(lock.lockedAt).getTime() < 5 * 60 * 1000
    );

    const alreadyBooked = seats.some((seat) => movie.bookedSeats.includes(seat));
    const alreadyLocked = seats.some((seat) =>
      movie.lockedSeats.some((lock) => lock.seat === seat && lock.lockedBy.toString() !== userId)
    );

    if (alreadyBooked || alreadyLocked) {
      return res.status(400).json({ message: "One or more seats are already booked or locked" });
    }

    // Lock seats
    seats.forEach((seat) => {
      movie.lockedSeats.push({ seat, lockedBy: userId, lockedAt: new Date() });
    });

    await movie.save();
    res.status(200).json({ message: "Seats locked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
