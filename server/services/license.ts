import crypto from 'crypto';
import { db } from '../db';
import { licenseKeys, transactions, bots } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class LicenseService {
  // Generate a secure license key
  static generateLicenseKey(): string {
    const prefix = 'BIN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    const checksum = crypto.createHash('md5').update(timestamp + random).digest('hex').substring(0, 4).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}-${checksum}`;
  }

  // Generate secure download token
  static generateDownloadToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create license for purchased bot
  static async generateLicense(
    transactionId: string,
    botId: string,
    userId: string,
    maxDownloads: number = 5
  ) {
    try {
      const licenseKey = this.generateLicenseKey();
      const downloadToken = this.generateDownloadToken();
      
      // License expires in 1 year
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Create download URL with secure token
      const downloadUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/download/${downloadToken}`;

      const [license] = await db.insert(licenseKeys).values({
        transactionId,
        botId,
        userId,
        licenseKey,
        downloadUrl,
        maxDownloads,
        expiresAt,
        isActive: true,
      }).returning();

      return {
        licenseKey,
        downloadUrl,
        downloadToken,
        maxDownloads,
        expiresAt,
        license,
      };
    } catch (error) {
      console.error('License generation error:', error);
      throw error;
    }
  }

  // Validate license key
  static async validateLicense(licenseKey: string, botId?: string) {
    try {
      const license = await db.query.licenseKeys.findFirst({
        where: and(
          eq(licenseKeys.licenseKey, licenseKey),
          eq(licenseKeys.isActive, true),
          botId ? eq(licenseKeys.botId, botId) : undefined
        ),
        with: {
          bot: true,
          user: true,
          transaction: true,
        },
      });

      if (!license) {
        return { valid: false, error: 'Invalid license key' };
      }

      // Check if expired
      if (license.expiresAt && new Date() > license.expiresAt) {
        return { valid: false, error: 'License has expired' };
      }

      // Check if transaction is completed
      if (license.transaction.status !== 'completed') {
        return { valid: false, error: 'License not activated - payment incomplete' };
      }

      return {
        valid: true,
        license,
        bot: license.bot,
        user: license.user,
      };
    } catch (error) {
      console.error('License validation error:', error);
      return { valid: false, error: 'License validation failed' };
    }
  }

  // Get download URL and track download
  static async getDownloadUrl(downloadToken: string, userId?: string) {
    try {
      // Extract token from URL if needed
      const token = downloadToken.includes('/') ? 
        downloadToken.split('/').pop() : downloadToken;

      const license = await db.query.licenseKeys.findFirst({
        where: and(
          eq(licenseKeys.downloadUrl, `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/download/${token}`),
          eq(licenseKeys.isActive, true),
          userId ? eq(licenseKeys.userId, userId) : undefined
        ),
        with: {
          bot: true,
          transaction: true,
        },
      });

      if (!license) {
        throw new Error('Invalid download link');
      }

      // Check if expired
      if (license.expiresAt && new Date() > license.expiresAt) {
        throw new Error('Download link has expired');
      }

      // Check download limit
      if (license.downloadCount >= license.maxDownloads) {
        throw new Error('Download limit exceeded');
      }

      // Check if transaction is completed
      if (license.transaction.status !== 'completed') {
        throw new Error('Download not available - payment incomplete');
      }

      // Increment download count
      await db.update(licenseKeys)
        .set({ downloadCount: license.downloadCount + 1 })
        .where(eq(licenseKeys.id, license.id));

      return {
        success: true,
        fileUrl: license.bot.fileUrl,
        fileName: license.bot.fileName || license.bot.title,
        botTitle: license.bot.title,
        remainingDownloads: license.maxDownloads - license.downloadCount - 1,
      };
    } catch (error) {
      console.error('Download URL error:', error);
      throw error;
    }
  }

  // Get user licenses
  static async getUserLicenses(userId: string) {
    try {
      const licenses = await db.query.licenseKeys.findMany({
        where: and(
          eq(licenseKeys.userId, userId),
          eq(licenseKeys.isActive, true)
        ),
        with: {
          bot: true,
          transaction: true,
        },
        orderBy: (licenseKeys, { desc }) => [desc(licenseKeys.createdAt)],
      });

      return licenses.map(license => ({
        ...license,
        isExpired: license.expiresAt ? new Date() > license.expiresAt : false,
        remainingDownloads: license.maxDownloads - license.downloadCount,
        canDownload: license.downloadCount < license.maxDownloads && 
                    (!license.expiresAt || new Date() <= license.expiresAt) &&
                    license.transaction.status === 'completed',
      }));
    } catch (error) {
      console.error('Get user licenses error:', error);
      throw error;
    }
  }

  // Deactivate license (for refunds)
  static async deactivateLicense(transactionId: string) {
    try {
      await db.update(licenseKeys)
        .set({ isActive: false })
        .where(eq(licenseKeys.transactionId, transactionId));

      return { success: true };
    } catch (error) {
      console.error('License deactivation error:', error);
      throw error;
    }
  }

  // Extend license expiry
  static async extendLicense(licenseId: string, months: number = 12) {
    try {
      const license = await db.query.licenseKeys.findFirst({
        where: eq(licenseKeys.id, licenseId),
      });

      if (!license) {
        throw new Error('License not found');
      }

      const currentExpiry = license.expiresAt || new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + months);

      await db.update(licenseKeys)
        .set({ expiresAt: newExpiry })
        .where(eq(licenseKeys.id, licenseId));

      return { success: true, newExpiry };
    } catch (error) {
      console.error('License extension error:', error);
      throw error;
    }
  }

  // Get license statistics
  static async getLicenseStats(botId?: string) {
    try {
      const whereClause = botId ? eq(licenseKeys.botId, botId) : undefined;
      
      const licenses = await db.query.licenseKeys.findMany({
        where: and(whereClause, eq(licenseKeys.isActive, true)),
      });

      const totalLicenses = licenses.length;
      const activeLicenses = licenses.filter(l => !l.expiresAt || new Date() <= l.expiresAt).length;
      const expiredLicenses = licenses.filter(l => l.expiresAt && new Date() > l.expiresAt).length;
      const totalDownloads = licenses.reduce((sum, l) => sum + l.downloadCount, 0);

      return {
        totalLicenses,
        activeLicenses,
        expiredLicenses,
        totalDownloads,
      };
    } catch (error) {
      console.error('License stats error:', error);
      throw error;
    }
  }
}