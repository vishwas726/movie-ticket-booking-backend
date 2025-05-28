import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectDatabase from "./config/DBConnect.js";

import movieRoutes from "./routes/movies.js";

import bookingRoutes from "./routes/bookings.js";

import AuthRoute from "./routes/AuthRoute.js";
import Movie from "./models/Movie.js";

connectDatabase();

dotenv.config();

const app = express();
app.use(bodyParser.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("Vishwas");
});

app.use("/user", AuthRoute);

app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);

app.post("/movie", async (req, res) => {

  try {
    
    const { title, description, showTime, totalSeats, bookedSeats } = req.body;

    const movie = new Movie({
      title,
      description,
      showTime,
      totalSeats,
      bookedSeats,
    });

    await movie.save();

    return res.json({ success: true, message: "Movie Added successfully" });
    
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
});
app.listen(5000, () => {
  console.log("Listen on port 5000");
});
