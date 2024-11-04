import jwt from 'jsonwebtoken';

export const generateToken = (id, role = 'user') => {
    const token = jwt.sign(
        { id, role },
        process.env.JWT_SECRET_KEY
    );
    return token;
};
