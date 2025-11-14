/**
 * Input validation utilities
 */

/**
 * Validate user input for bio (max 500 characters)
 */
const validateBio = (bio) => {
  if (!bio || bio.trim().length === 0) {
    return { valid: false, error: 'Bio cannot be empty' };
  }
  if (bio.length > 500) {
    return { valid: false, error: 'Bio must be less than 500 characters' };
  }
  return { valid: true };
};

/**
 * Validate location coordinates
 */
const validateLocation = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { valid: false, error: 'Invalid coordinates' };
  }
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  return { valid: true };
};

/**
 * Validate payment amount
 */
const validatePaymentAmount = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Invalid payment amount' };
  }
  return { valid: true, amount: num };
};

/**
 * Sanitize user input to prevent injection attacks
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

module.exports = {
  validateBio,
  validateLocation,
  validatePaymentAmount,
  sanitizeInput
};
