import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    if (!USERNAME_REGEX.test(username)) {
      res.status(400).json({ error: 'Invalid username format' });
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      res.status(400).json({ error: 'Invalid password format' });
      return;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      res.status(400).json({ error: 'Username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/Email and password are required' });
      return;
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture },
    });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, access_token } = req.body;
    
    let email, name, picture;

    if (credential) {
      const decoded = jwt.decode(credential) as any;
      if (!decoded || !decoded.email) {
        res.status(400).json({ error: 'Invalid Google token' });
        return;
      }
      email = decoded.email;
      name = decoded.name;
      picture = decoded.picture;
    } else if (access_token) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const data = await response.json() as any;
      if (!data.email) {
        res.status(400).json({ error: 'Invalid access token' });
        return;
      }
      email = data.email;
      name = data.name;
      picture = data.picture;
    } else {
      res.status(400).json({ error: 'Google credential or access_token is required' });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      let baseUsername = name.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      if (baseUsername.length < 4) {
        baseUsername = baseUsername + 'user';
      }
      baseUsername = baseUsername.substring(0, 16);
      
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        username: uniqueUsername,
        email,
        provider: 'google',
        profilePicture: picture,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture },
    });

  } catch (error) {
    console.error('[googleAuth]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { username, password, profilePicture } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (username) {
      if (!USERNAME_REGEX.test(username)) {
        res.status(400).json({ error: 'Invalid username format' });
        return;
      }
      const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUsername) {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }
      user.username = username;
    }

    if (password) {
      if (!PASSWORD_REGEX.test(password)) {
        res.status(400).json({ error: 'Invalid password format' });
        return;
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture }
    });
  } catch (error) {
    console.error('[updateProfile]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAccount = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('[deleteAccount]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Always return generic success message to prevent email enumeration
    const message = 'If an account exists with that email, a password reset link has been sent.';

    if (!user) {
      res.status(200).json({ message });
      return;
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to user document
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await user.save();

    // Create reset url
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const emailMessage = `
We received a request to reset your RepoLens AI password.

Click this link to reset your password:
${resetUrl}

This link will expire in 30 minutes.

If you did not request this, you can safely ignore this email.
`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'RepoLens AI - Password Reset',
        message: emailMessage
      });
      res.status(200).json({ message });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.status(500).json({ error: 'Email could not be sent' });
    }
  } catch (error) {
    console.error('[forgotPassword]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      res.status(400).json({ error: 'Invalid password format. Must be 8-16 chars, contain upper/lower/number/special.' });
      return;
    }

    // Hash token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
      return;
    }

    // Hash new password
    user.password = await bcrypt.hash(password, 10);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('[resetPassword]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
