import pool from '../config/db.js';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

// Configure Nodemailer (Mock for Dev, or use real credentials)
// For real production, use environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS
const transporter = nodemailer.createTransport({
    // Example for Gmail (requires App Password)
    // service: 'gmail',
    // auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    
    // For Dev: process.env.SMTP_HOST ? ... : { jsonTransport: true }
    jsonTransport: true
});

export const sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const type = 'email';

    try {
        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Delete old codes for this identifier
        await pool.query(`DELETE FROM email_verifications WHERE ${type} = ?`, [email]);

        // Save to DB
        await pool.query(
            `INSERT INTO email_verifications (${type}, code, expires_at) VALUES (?, ?, ?)`,
            [email, code, expiresAt]
        );

        // Send Email (Mock for now)
        console.log(`[EMAIL DEV] Sending code ${code} to ${email}`);
        // Note: Configure Nodemailer here for real email
        
        res.json({ message: 'Verification code sent.' }); 

    } catch (error) {
        console.error('Error sending verification code:', error);
        res.status(500).json({ message: 'Failed to send verification code' });
    }
};

export const verifyEmailCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
    }

    const type = 'email';

    try {
        const [rows] = await pool.query(
            `SELECT * FROM email_verifications WHERE ${type} = ? AND code = ?`,
            [email, code]
        );

        if (rows.length === 0) {
            console.log(`[Verify] Code not found for ${email}`);
            return res.status(400).json({ message: 'Invalid code' });
        }

        const verification = rows[0];
        if (new Date() > new Date(verification.expires_at)) {
             console.log(`[Verify] Code expired for ${email}. Expired at ${verification.expires_at}`);
             return res.status(400).json({ message: 'Code expired. Please request a new one.' });
        }

        // Delete used code
        await pool.query('DELETE FROM email_verifications WHERE id = ?', [rows[0].id]);

        res.json({ message: 'Verified successfully', success: true });

    } catch (error) {
        console.error('Error verifying code:', error);
        res.status(500).json({ message: 'Failed to verify code' });
    }
};
