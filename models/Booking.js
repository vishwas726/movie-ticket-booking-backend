import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
//   userName: String,
  seats: [Number],
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);