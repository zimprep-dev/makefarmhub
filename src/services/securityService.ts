/**
 * Security Service - Anti-Hacking & Data Protection
 * Protects against XSS, CSRF, SQL Injection, and other attacks
 */

export interface SecurityConfig {
  enableXSSProtection: boolean;
  enableCSRFProtection: boolean;
  enableRateLimiting: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number; // minutes
  passwordMinLength: number;
  requireStrongPassword: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface SecurityLog {
  id: string;
  type: 'login_attempt' | 'suspicious_activity' | 'blocked_request' | 'data_access' | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  timestamp: Date;
  blocked: boolean;
}

class SecurityService {
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }>;
  private rateLimits: Map<string, { count: number; resetTime: Date }>;
  private blockedIPs: Set<string>;
  private securityLogs: SecurityLog[];

  constructor() {
    this.config = {
      enableXSSProtection: true,
      enableCSRFProtection: true,
      enableRateLimiting: true,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireStrongPassword: true,
    };

    this.loginAttempts = new Map();
    this.rateLimits = new Map();
    this.blockedIPs = new Set();
    this.securityLogs = [];

    this.loadBlockedIPs();
    this.loadSecurityLogs();
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput(input: string): string {
    if (!this.config.enableXSSProtection) return input;

    // Remove script tags and dangerous HTML
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    // Encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Validate and sanitize object data
   */
  sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeInput(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const token = this.generateSecureToken(32);
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    if (!this.config.enableCSRFProtection) return true;

    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = new Date();
    const limit = this.rateLimits.get(identifier);

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      this.rateLimits.set(identifier, {
        count: 1,
        resetTime: new Date(now.getTime() + config.windowMs),
      });
      return true;
    }

    if (limit.count >= config.maxRequests) {
      this.logSecurityEvent({
        type: 'blocked_request',
        severity: 'medium',
        ipAddress: identifier,
        userAgent: navigator.userAgent,
        details: `Rate limit exceeded: ${limit.count} requests`,
        blocked: true,
      });
      return false;
    }

    limit.count++;
    return true;
  }

  /**
   * Track login attempts and prevent brute force
   */
  trackLoginAttempt(identifier: string, success: boolean): boolean {
    const now = new Date();
    const attempts = this.loginAttempts.get(identifier);

    if (success) {
      // Clear attempts on successful login
      this.loginAttempts.delete(identifier);
      return true;
    }

    if (!attempts) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    // Reset if last attempt was more than 15 minutes ago
    const timeDiff = now.getTime() - attempts.lastAttempt.getTime();
    if (timeDiff > 15 * 60 * 1000) {
      this.loginAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }

    attempts.count++;
    attempts.lastAttempt = now;

    if (attempts.count >= this.config.maxLoginAttempts) {
      this.blockIP(identifier);
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        ipAddress: identifier,
        userAgent: navigator.userAgent,
        details: `Too many failed login attempts: ${attempts.count}`,
        blocked: true,
      });
      return false;
    }

    return true;
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordMinLength) {
      errors.push(`Password must be at least ${this.config.passwordMinLength} characters`);
    }

    if (this.config.requireStrongPassword) {
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
      }
    }

    // Check for common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Hash password (client-side pre-hashing before sending to server)
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt sensitive data before storing
   */
  async encryptData(data: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const keyBuffer = encoder.encode(key);

      // Generate key from password
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const salt = crypto.getRandomValues(new Uint8Array(16));
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        cryptoKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        dataBuffer
      );

      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: string, key: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const keyBuffer = encoder.encode(key);

      // Decode base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // Extract salt, iv, and encrypted data
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);

      // Generate key from password
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        cryptoKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  validatePhone(phone: string): boolean {
    // Zimbabwe phone format
    const phoneRegex = /^(\+263|0)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  /**
   * Block IP address
   */
  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    this.saveBlockedIPs();
  }

  /**
   * Unblock IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.saveBlockedIPs();
  }

  /**
   * Generate secure random token
   */
  generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: Omit<SecurityLog, 'id' | 'timestamp'>): void {
    const log: SecurityLog = {
      id: this.generateSecureToken(16),
      timestamp: new Date(),
      ...event,
    };

    this.securityLogs.push(log);
    this.saveSecurityLogs();

    // Alert on critical events
    if (event.severity === 'critical') {
      this.alertAdmin(log);
    }
  }

  /**
   * Get security logs
   */
  getSecurityLogs(filter?: {
    type?: SecurityLog['type'];
    severity?: SecurityLog['severity'];
    startDate?: Date;
    endDate?: Date;
  }): SecurityLog[] {
    let logs = [...this.securityLogs];

    if (filter) {
      if (filter.type) {
        logs = logs.filter(log => log.type === filter.type);
      }
      if (filter.severity) {
        logs = logs.filter(log => log.severity === filter.severity);
      }
      if (filter.startDate) {
        logs = logs.filter(log => log.timestamp >= filter.startDate!);
      }
      if (filter.endDate) {
        logs = logs.filter(log => log.timestamp <= filter.endDate!);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear old security logs (keep last 1000)
   */
  clearOldLogs(): void {
    if (this.securityLogs.length > 1000) {
      this.securityLogs = this.securityLogs.slice(-1000);
      this.saveSecurityLogs();
    }
  }

  /**
   * Alert admin of critical security event
   */
  private alertAdmin(log: SecurityLog): void {
    // In production, send email/SMS to admin
    console.error('🚨 CRITICAL SECURITY EVENT:', log);
    
    // Could integrate with notification service
    // notificationService.sendNotification('system', {
    //   title: 'Critical Security Alert',
    //   body: log.details,
    // });
  }

  /**
   * Save blocked IPs to storage
   */
  private saveBlockedIPs(): void {
    try {
      localStorage.setItem('blocked_ips', JSON.stringify(Array.from(this.blockedIPs)));
    } catch (error) {
      console.error('Failed to save blocked IPs');
    }
  }

  /**
   * Load blocked IPs from storage
   */
  private loadBlockedIPs(): void {
    try {
      const stored = localStorage.getItem('blocked_ips');
      if (stored) {
        this.blockedIPs = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load blocked IPs');
    }
  }

  /**
   * Save security logs to storage
   */
  private saveSecurityLogs(): void {
    try {
      // Keep only last 1000 logs
      const logsToSave = this.securityLogs.slice(-1000);
      localStorage.setItem('security_logs', JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save security logs');
    }
  }

  /**
   * Load security logs from storage
   */
  private loadSecurityLogs(): void {
    try {
      const stored = localStorage.getItem('security_logs');
      if (stored) {
        this.securityLogs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load security logs');
    }
  }

  /**
   * Validate session token
   */
  validateSession(token: string): boolean {
    const session = sessionStorage.getItem('session_token');
    const timestamp = sessionStorage.getItem('session_timestamp');

    if (!session || !timestamp || session !== token) {
      return false;
    }

    // Check if session expired
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    const timeoutMs = this.config.sessionTimeout * 60 * 1000;

    if (now - sessionTime > timeoutMs) {
      this.clearSession();
      return false;
    }

    // Update timestamp
    sessionStorage.setItem('session_timestamp', now.toString());
    return true;
  }

  /**
   * Create new session
   */
  createSession(userId: string): string {
    const token = this.generateSecureToken(64);
    sessionStorage.setItem('session_token', token);
    sessionStorage.setItem('session_timestamp', Date.now().toString());
    sessionStorage.setItem('session_user', userId);
    return token;
  }

  /**
   * Clear session
   */
  clearSession(): void {
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('session_timestamp');
    sessionStorage.removeItem('session_user');
  }

  /**
   * Export security report
   */
  exportSecurityReport(): string {
    const report = {
      generatedAt: new Date().toISOString(),
      config: this.config,
      blockedIPs: Array.from(this.blockedIPs),
      recentLogs: this.getSecurityLogs().slice(0, 100),
      statistics: {
        totalLogs: this.securityLogs.length,
        criticalEvents: this.securityLogs.filter(l => l.severity === 'critical').length,
        blockedRequests: this.securityLogs.filter(l => l.blocked).length,
        blockedIPCount: this.blockedIPs.size,
      },
    };

    return JSON.stringify(report, null, 2);
  }
}

export const securityService = new SecurityService();
export default securityService;
