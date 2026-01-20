import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        // Ignore expiration to handle large client/server clock skews (e.g. 2025 vs 2026)
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

export const isApproved = (req, res, next) => {
    // Admins are always approved, users need manual approval (true or 1)
    if (req.user && (req.user.role === 'admin' || req.user.approved == true)) {
        next();
    } else {
        res.status(403).json({ message: 'Account pending approval. Please wait for admin approval.' });
    }
};
