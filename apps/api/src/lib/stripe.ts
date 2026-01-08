import Stripe from "stripe";
import env from "../config/env.config.js";

const stripe = new Stripe(env.stripeSecretKey);

export default stripe;
