/* eslint-disable no-undef */
import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.post('/referral', async (req, res) => {
    const { referrerName, referrerEmail, refereeName, refereeEmail, course } = req.body;
    console.log(req.body);


    if (!referrerName || !referrerEmail || !refereeName || !refereeEmail || !course) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const referral = await prisma.referral.create({
            data: { referrerName, referrerEmail, refereeName, refereeEmail, course }
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: refereeEmail,
            subject: 'You have been referred!',
            text: `Hello ${refereeName},\n\nYou have been referred to the ${course} course by ${referrerName}.\n\nBest regards,\nYour Team`
        };

        const mailOptions1 = {
            from: process.env.GMAIL_USER,
            to: referrerEmail,
            subject: 'You have used your referal',
            text: `Hello ${referrerName},\n\nYour referal has been used by ${refereeName} for the course ${course}.\n\nBest regards,\nYour Team`
        };

        await transporter.sendMail(mailOptions);
        await transporter.sendMail(mailOptions1);
        res.status(200).json(referral);
    } catch (error) {
        console.error('Error sending email:', error.message);
        res.status(500).json({ error: 'Failed to process referral' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
