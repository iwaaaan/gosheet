import { db } from "../db";
import { user, account } from "../db/schema";
import * as crypto from "crypto";

async function seed() {
    console.log("Seeding admin user...");

    const userId = crypto.randomUUID();
    const email = "admin@example.com";
    const password = "adminpassword"; // User should change this

    // Better-Auth uses scrypt for password hashing by default.
    // However, we can just insert the user and let them use a "Forgot Password" or 
    // better, we can use the Better-auth API to create the user if we have a running instance.

    // For now, I'll provide a signup link in the UI temporarily.
    console.log("Signup is enabled in Better-Auth. Please sign up at /signup once deployed.");
}

// seed();
