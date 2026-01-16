// ============================================
// PUMPBET - Security Layer
// Protects against common vulnerabilities
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// ============================================
// SECURITY HEADERS
// Standard security headers for API responses
// ============================================

export const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

// ============================================
// RATE LIMITING
// In-memory store (use Redis in production)
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,      // 60 requests per minute
};

const strictRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10,      // 10 requests per minute (for sensitive operations)
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultRateLimit
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetTime - now };
}

// Rate limiter factory for different operation types
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  placeBet: { windowMs: 60 * 1000, maxRequests: 20 },
  vote: { windowMs: 60 * 1000, maxRequests: 30 },
  submit: { windowMs: 60 * 1000, maxRequests: 5 },
  claim: { windowMs: 60 * 1000, maxRequests: 10 },
  liquidity: { windowMs: 60 * 1000, maxRequests: 15 },
  default: { windowMs: 60 * 1000, maxRequests: 60 },
};

export function getRateLimiter(operationType: string) {
  const config = rateLimitConfigs[operationType] || rateLimitConfigs.default;
  return {
    check: (identifier: string): boolean => {
      const result = checkRateLimit(`${operationType}:${identifier}`, config);
      return result.allowed;
    },
  };
}

// ============================================
// INPUT VALIDATION
// ============================================

// Solana address validation
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Validate and sanitize string input
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .slice(0, maxLength)
    // Remove potential XSS vectors
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    // Remove null bytes
    .replace(/\0/g, '');
}

// Validate numeric input
export function validateAmount(amount: unknown): { valid: boolean; value: number; error?: string } {
  if (typeof amount !== 'number' && typeof amount !== 'string') {
    return { valid: false, value: 0, error: 'Amount must be a number' };
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { valid: false, value: 0, error: 'Amount must be a valid number' };
  }

  if (num <= 0) {
    return { valid: false, value: 0, error: 'Amount must be greater than 0' };
  }

  // Maximum bet amount (prevent overflow attacks)
  const MAX_BET_AMOUNT = 1000; // 1000 SOL
  if (num > MAX_BET_AMOUNT) {
    return { valid: false, value: 0, error: `Amount cannot exceed ${MAX_BET_AMOUNT} SOL` };
  }

  // Ensure reasonable precision (9 decimals for SOL)
  const rounded = Math.round(num * 1e9) / 1e9;
  return { valid: true, value: rounded };
}

// Validate category input
export function validateCategory(category: string): boolean {
  const validCategories = ['kol', 'crypto', 'token', 'other', 'all'];
  return validCategories.includes(category);
}

// Validate bet side
export function validateSide(side: string): side is 'yes' | 'no' {
  return side === 'yes' || side === 'no';
}

// ============================================
// SIGNATURE VERIFICATION
// Verify Solana wallet signatures
// ============================================

export interface SignatureVerification {
  valid: boolean;
  error?: string;
}

export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): SignatureVerification {
  try {
    // For development/testing, allow empty signatures with a flag
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_SIGNATURE_VERIFICATION === 'true') {
      console.warn('⚠️  Signature verification skipped in development mode');
      return { valid: true };
    }

    if (!signature) {
      return { valid: false, error: 'Signature is required' };
    }

    if (!isValidSolanaAddress(publicKey)) {
      return { valid: false, error: 'Invalid public key' };
    }

    const pubKey = new PublicKey(publicKey);
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);

    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      pubKey.toBytes()
    );

    if (!verified) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
  } catch (error) {
    console.error('Signature verification error:', error);
    return { valid: false, error: 'Signature verification failed' };
  }
}

// ============================================
// REQUEST VALIDATION MIDDLEWARE
// ============================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedData?: Record<string, unknown>;
}

export function validateBetPlacement(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};

  // Validate side
  if (!body.side || !validateSide(body.side as string)) {
    errors.push('Side must be "yes" or "no"');
  } else {
    sanitized.side = body.side;
  }

  // Validate amount
  const amountResult = validateAmount(body.amount);
  if (!amountResult.valid) {
    errors.push(amountResult.error || 'Invalid amount');
  } else {
    sanitized.amount = amountResult.value;
  }

  // Validate wallet address
  if (!body.walletAddress || typeof body.walletAddress !== 'string') {
    errors.push('Wallet address is required');
  } else if (!isValidSolanaAddress(body.walletAddress)) {
    errors.push('Invalid Solana wallet address');
  } else {
    sanitized.walletAddress = body.walletAddress;
  }

  // Signature (optional in dev, required in prod)
  if (body.signature) {
    sanitized.signature = body.signature;
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('. ') };
  }

  return { valid: true, sanitizedData: sanitized };
}

export function validateBetCreation(body: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const sanitized: Record<string, unknown> = {};

  // Required string fields
  const stringFields = ['kolName', 'kolTicker', 'kolImage', 'title', 'description', 'resolutionCriteria', 'creatorWallet'];
  for (const field of stringFields) {
    if (!body[field] || typeof body[field] !== 'string') {
      errors.push(`${field} is required`);
    } else {
      sanitized[field] = sanitizeString(body[field] as string, field === 'description' ? 500 : 200);
    }
  }

  // Validate creator wallet
  if (body.creatorWallet && !isValidSolanaAddress(body.creatorWallet as string)) {
    errors.push('Invalid creator wallet address');
  }

  // Validate category
  if (!body.category || !validateCategory(body.category as string)) {
    errors.push('Invalid category');
  } else {
    sanitized.category = body.category;
  }

  // Validate end time
  if (!body.endTime) {
    errors.push('End time is required');
  } else {
    const endTime = new Date(body.endTime as string);
    if (isNaN(endTime.getTime())) {
      errors.push('Invalid end time format');
    } else if (endTime <= new Date()) {
      errors.push('End time must be in the future');
    } else {
      // Maximum bet duration: 90 days
      const maxEndTime = new Date();
      maxEndTime.setDate(maxEndTime.getDate() + 90);
      if (endTime > maxEndTime) {
        errors.push('End time cannot be more than 90 days in the future');
      } else {
        sanitized.endTime = endTime;
      }
    }
  }

  // Optional fields
  if (body.kolTwitter) {
    sanitized.kolTwitter = sanitizeString(body.kolTwitter as string, 50);
  }
  if (body.resolutionSource) {
    sanitized.resolutionSource = sanitizeString(body.resolutionSource as string, 500);
  }

  // Validate initial pools
  if (body.initialYesPool !== undefined) {
    const result = validateAmount(body.initialYesPool);
    if (result.valid) {
      sanitized.initialYesPool = result.value;
    }
  }
  if (body.initialNoPool !== undefined) {
    const result = validateAmount(body.initialNoPool);
    if (result.valid) {
      sanitized.initialNoPool = result.value;
    }
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('. ') };
  }

  return { valid: true, sanitizedData: sanitized };
}

// ============================================
// API SECURITY HEADERS
// ============================================

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

// ============================================
// ERROR RESPONSES
// ============================================

export function rateLimitError(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(resetIn / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
      },
    }
  );
}

export function validationError(message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 }
  );
}

export function unauthorizedError(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function serverError(message: string = 'Internal server error'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

// ============================================
// RATE LIMIT CONFIGS FOR DIFFERENT ENDPOINTS
// ============================================

export const RATE_LIMITS = {
  // General API calls
  default: { windowMs: 60 * 1000, maxRequests: 100 },

  // Placing bets (more restrictive)
  placeBet: { windowMs: 60 * 1000, maxRequests: 20 },

  // Creating bets (most restrictive)
  createBet: { windowMs: 60 * 1000, maxRequests: 5 },

  // Chat API
  chat: { windowMs: 60 * 1000, maxRequests: 30 },

  // Search/fetch operations
  read: { windowMs: 60 * 1000, maxRequests: 120 },
};

// ============================================
// HELPER: Get client identifier for rate limiting
// ============================================

export function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP
  const ip = cfIp || realIp || (forwarded?.split(',')[0].trim()) || 'unknown';

  return ip;
}
