import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    // Lab 04: Wishlist references
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Lab 05: Cart items
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity cannot be less than 1"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual alias 'name' for fullName for seamless frontend compatibility
customerSchema.virtual("name").get(function () {
  return this.fullName;
});

// Configure JSON serialization to include id and virtuals
customerSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
