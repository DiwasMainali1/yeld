import { OAuth2Client } from 'google-auth-library';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        const { email, name, picture, given_name, sub } = payload;
        
        let user = await User.findOne({ email });
        
        if (!user) {
            let username = given_name.toLowerCase();
            let counter = 0;
            
            while (await User.findOne({ username: counter === 0 ? username : `${username}${counter}` })) {
                counter++;
            }
            
            user = await User.create({
                username: counter === 0 ? username : `${username}${counter}`,
                email,
                password: sub + Math.random().toString(36).substring(2),
                profilePhoto: picture || ''
            });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
};

export { googleAuth };