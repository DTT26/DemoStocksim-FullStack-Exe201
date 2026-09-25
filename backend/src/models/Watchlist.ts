import mongoose, { Schema, Document } from 'mongoose';

export interface IWatchlist extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WatchlistSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    symbols: { type: [String], default: [] }
  },
  { timestamps: true }
);

// Ensure a user can have watchlists with the same name if needed, or we could add a unique compound index.
// WatchlistSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model<IWatchlist>('Watchlist', WatchlistSchema);
