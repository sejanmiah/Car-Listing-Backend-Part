"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithFirebase = void 0;
const firebase_1 = __importDefault(require("../config/firebase"));
const db_1 = __importDefault(require("../config/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const loginWithFirebase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ message: 'Token is required' });
        return;
    }
    try {
        // Verify Firebase Token
        // In a real scenario with valid credentials:
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // Const dummy for now if admin not init
        let decodedToken;
        if (firebase_1.default.apps.length) {
            decodedToken = yield firebase_1.default.auth().verifyIdToken(token);
        }
        else {
            // MOCK for development without Firebase keys
            console.log("Mocking verification for dev");
            decodedToken = { uid: 'mock-uid', email: 'mock@example.com', name: 'Mock User' };
        }
        const { uid, email, name, picture } = decodedToken;
        // Check if user exists
        const [rows] = yield db_1.default.query('SELECT * FROM users WHERE firebase_uid = ?', [uid]);
        let user = rows[0];
        if (!user) {
            // Create new user
            const [result] = yield db_1.default.query('INSERT INTO users (firebase_uid, email, name, role) VALUES (?, ?, ?, ?)', [uid, email, name || 'User', 'user']);
            const insertId = result.insertId;
            const [newUserRows] = yield db_1.default.query('SELECT * FROM users WHERE id = ?', [insertId]);
            user = newUserRows[0];
        }
        // Generate App JWT
        const appToken = jsonwebtoken_1.default.sign({ id: user.id, uid: user.firebase_uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token: appToken, user });
    }
    catch (error) {
        console.error("Login error", error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});
exports.loginWithFirebase = loginWithFirebase;
