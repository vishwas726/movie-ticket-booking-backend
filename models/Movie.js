import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  showTime: String,
  totalSeats: Number,
  bookedSeats: [Number],

  lockedSeats: [
    {
      seat: Number,
      lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      lockedAt: { type: Date, default: Date.now },
    }
  ]
});


export default mongoose.model('Movie', movieSchema);
