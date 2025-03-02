// Common patterns and weights for vehicle matching

// Aliases for common terms
export const makeAliases = { 'vw': 'volkswagen' };
export const modelAliases = { 'rav 4': 'rav4' };

// Known vehicles not in our database
export const unknownMakes = ['honda', 'ford', 'bmw', 'mazda', 'hyundai', 'kia', 'nissan', 'subaru', 'mercedes', 'lexus'];
export const unknownModels = ['polo', 'corolla', 'accord', 'mustang', 'civic', 'hilux'];

// Badge and trim patterns
export const badgePatterns = [
    'r', 'gti', '110tsi', '132tsi', '162tsi', 'tdi550', 'tdi580',
    'highline', 'comfortline', 'trendline', 'alltrack',
    'gx', 'gxl', 'cruiser', 'edge', 'gts', 'grande'
];

// Feature patterns for detection
export const fuelTypePatterns = {
    'petrol': ['petrol', 'gasoline', 'gas'],
    'diesel': ['diesel'],
    'hybrid-petrol': ['hybrid'],
    'electric': ['electric']
};

export const transmissionPatterns = {
    'automatic': ['automatic', 'auto'],
    'manual': ['manual', 'stick', 'stick shift']
};

export const driveTypePatterns = {
    'four wheel drive': ['four wheel drive', '4wd', '4x4', 'all wheel drive', 'awd'],
    'front wheel drive': ['front wheel drive', 'fwd'],
    'rear wheel drive': ['rear wheel drive', 'rwd']
};

// Importance weights for matching attributes
export const attributeWeights = {
    'make': 3,
    'model': 3,
    'badge': 2,
    'fuel_type': 2,
    'transmission_type': 1,
    'drive_type': 1
}; 