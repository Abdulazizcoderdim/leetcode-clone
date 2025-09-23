import rateLimit from "express-rate-limit";

const limit = rateLimit({
  windowMs: 60000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error:
      "You have sent too many requests in a given amount of time. Please try again after 1 minute.",
  },
});

export default limit;
