import pool from '../config/db.js';
import { notifyAdmins } from '../utils/notificationUtils.js';

export const createLead = async (req, res) => {
    const { car_id, name, email, phone } = req.body;

    if (!car_id || !name || !email || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO leads (car_id, name, email, phone) VALUES (?, ?, ?, ?)',
            [car_id, name, email, phone]
        );
        res.status(201).json({ message: "Lead submitted successfully", id: result.insertId });
        
        // Notify Admins
        await notifyAdmins('New Lead', `New potential buyer ${name} is interested in a car.`, 'lead', result.insertId);
    } catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({ message: "Failed to submit lead" });
    }
};

export const getLeads = async (req, res) => {
    try {
        const [leads] = await pool.query(`
            SELECT leads.*, cars.title as car_title, cars.brand, cars.model 
            FROM leads 
            LEFT JOIN cars ON leads.car_id = cars.id 
            ORDER BY leads.created_at DESC
        `);
        res.json(leads);
    } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ message: "Failed to fetch leads" });
    }
};
