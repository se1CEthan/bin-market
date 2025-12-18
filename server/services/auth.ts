import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from '../db';
import { users, emailVerificationTokens, passwordResetTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendEmail } from './email';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY_HOURS = 24;

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate secure token
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Register user with email/password
  static async registerUser(email: string, password: string, name: string) {
    try {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const [newUser] = await db.insert(users).values({
        email: email.toLowerCase(),
        name,
        passwordHash,
        isEmailVerified: false,
      }).returning();

      // Generate verification token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await db.insert(emailVerificationTokens).values({
        userId: newUser.id,
        token,
        expiresAt,
      });

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify your BIN account',
        template: 'email-verification',
        data: {
          name,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
        },
      });

      return { user: newUser, message: 'Registration successful. Please check your email to verify your account.' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user with email/password
  static async loginUser(email: string, password: string) {
    try {
      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (!user || !user.passwordHash) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      // Update last login
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Verify email token
  static async verifyEmail(token: string) {
    try {
      // Find valid token
      const verificationToken = await db.query.emailVerificationTokens.findFirst({
        where: and(
          eq(emailVerificationTokens.token, token),
          gt(emailVerificationTokens.expiresAt, new Date())
        ),
        with: {
          user: true,
        },
      });

      if (!verificationToken) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user as verified
      await db.update(users)
        .set({ isEmailVerified: true })
        .where(eq(users.id, verificationToken.userId));

      // Delete used token
      await db.delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.id, verificationToken.id));

      return { message: 'Email verified successfully' };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.isEmailVerified) {
        throw new Error('Email is already verified');
      }

      // Delete existing tokens
      await db.delete(emailVerificationTokens)
        .where(eq(emailVerificationTokens.userId, user.id));

      // Generate new token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await db.insert(emailVerificationTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send verification email
      await sendEmail({
        to: email,
        subject: 'Verify your BIN account',
        template: 'email-verification',
        data: {
          name: user.name,
          verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
        },
      });

      return { message: 'Verification email sent' };
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      });

      if (!user) {
        // Don't reveal if user exists or not
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      // Delete existing reset tokens
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, user.id));

      // Generate reset token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // Send reset email
      await sendEmail({
        to: email,
        subject: 'Reset your BIN password',
        template: 'password-reset',
        data: {
          name: user.name,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        },
      });

      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token: string, newPassword: string) {
    try {
      // Find valid token
      const resetToken = await db.query.passwordResetTokens.findFirst({
        where: and(
          eq(passwordResetTokens.token, token),
          gt(passwordResetTokens.expiresAt, new Date())
        ),
        with: {
          user: true,
        },
      });

      if (!resetToken) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update user password
      await db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, resetToken.userId));

      // Delete used token
      await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, resetToken.id));

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Change password (for logged-in users)
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user || !user.passwordHash) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await this.verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const passwordHash = await this.hashPassword(newPassword);

      // Update password
      await db.update(users)
        .set({ passwordHash })
        .where(eq(users.id, userId));

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
}