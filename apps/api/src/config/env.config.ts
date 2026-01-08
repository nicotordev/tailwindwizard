const env = {
  clerkSecretKey: process.env.CLERK_SECRET_KEY as string,
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY as string,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
};

export default env;
