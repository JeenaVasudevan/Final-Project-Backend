import jwt from 'jsonwebtoken';

export const authAdmin = (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: 'User not authorized: Token missing' });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!tokenVerified) {
            return res.status(401).json({ message: 'User not authorized: Invalid token' });
        }

        if (tokenVerified.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        req.user = tokenVerified;
        next();
    } catch (error) {
        console.error("Authorization Error:", error);
        return res.status(401).json({ message: 'User authorization failed' });
    }
};
