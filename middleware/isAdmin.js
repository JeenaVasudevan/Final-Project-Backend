export const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(403).json({ message: 'Access denied: User not authenticated' });
        }
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }
        next();
    } catch (error) {
        console.error("Authorization Error:", error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
