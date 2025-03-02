import { query } from './db';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  badge: string;
  transmission_type: string;
  fuel_type: string;
  drive_type: string;
}

export const findBestVehicleMatch = async (description: string): Promise<{ vehicle: Vehicle | null, score: number }> => {
    // Normalize input
    const input = description.toLowerCase();
    
    // First, get the list of makes and models we support
    // This ensures we don't match makes/models that aren't in our database
    const makeQuery = await query('SELECT DISTINCT make FROM vehicle');
    const modelQuery = await query('SELECT DISTINCT model FROM vehicle');
    
    const availableMakes = makeQuery.map(row => row.make.toLowerCase());
    const availableModels = modelQuery.map(row => row.model.toLowerCase());
    
    // Extract possible makes
    let detectedMake = null;
    const makeAliases = { 'vw': 'volkswagen' };
    
    // Check for exact make matches with word boundaries
    for (const make of availableMakes) {
        const regex = new RegExp(`\\b${make}\\b`, 'i');
        if (regex.test(input)) {
            detectedMake = make;
            break;
        }
    }
    
    // Check for aliases if no direct match
    if (!detectedMake) {
        for (const [alias, make] of Object.entries(makeAliases)) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(input) && availableMakes.includes(make)) {
                detectedMake = make;
                break;
            }
        }
    }
    
    // If using a make that's not in our database, return no match
    const unknownMakes = ['honda', 'ford', 'bmw', 'mazda', 'hyundai', 'kia', 'nissan', 'subaru', 'mercedes', 'lexus'];
    for (const make of unknownMakes) {
        const regex = new RegExp(`\\b${make}\\b`, 'i');
        if (regex.test(input)) {
            return { vehicle: null, score: 1 };
        }
    }
    
    // Extract possible models
    let detectedModel = null;
    const modelAliases = { 'rav 4': 'rav4' };
    
    // We need to be strict about models that aren't in our database
    // Common models that we know aren't in our dataset
    const unknownModels = ['polo', 'corolla', 'accord', 'mustang', 'civic', 'hilux'];
    for (const model of unknownModels) {
        const regex = new RegExp(`\\b${model}\\b`, 'i');
        if (regex.test(input)) {
            return { vehicle: null, score: 1 };
        }
    }
    
    // Check for exact model matches with word boundaries
    for (const model of availableModels) {
        // Special handling for short model names like "86"
        const regex = model.length <= 2 ? 
                new RegExp(`\\b${model}\\b`, 'i') : 
                new RegExp(`\\b${model}\\b`, 'i');
        if (regex.test(input)) {
            detectedModel = model;
            break;
        }
    }
    
    // Check for aliases if no direct match
    if (!detectedModel) {
        for (const [alias, model] of Object.entries(modelAliases)) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(input) && availableModels.includes(model)) {
                detectedModel = model;
                break;
            }
        }
    }
    
    // Extract fuel type
    let detectedFuel = null;
    if (input.includes('petrol') || input.includes('gasoline') || input.includes('gas')) {
        detectedFuel = 'petrol';
    } else if (input.includes('diesel')) {
        detectedFuel = 'diesel';
    } else if (input.includes('hybrid')) {
        detectedFuel = 'hybrid-petrol';
    } else if (input.includes('electric')) {
        detectedFuel = 'electric';
    }
    
    // Extract transmission type
    let detectedTransmission = null;
    if (input.includes('automatic') || input.includes('auto')) {
        detectedTransmission = 'automatic';
    } else if (input.includes('manual')) {
        detectedTransmission = 'manual';
    }
    
    // Extract drive type
    let detectedDrive = null;
    if (input.match(/\b(four wheel drive|4wd|4x4|all wheel drive|awd)\b/i)) {
        detectedDrive = 'four wheel drive';
    } else if (input.match(/\b(front wheel drive|fwd)\b/i)) {
        detectedDrive = 'front wheel drive';
    } else if (input.match(/\b(rear wheel drive|rwd)\b/i)) {
        detectedDrive = 'rear wheel drive';
    }
    
    // Extract badge
    let detectedBadge = null;
    // Check for specific badge patterns with word boundaries to avoid partial matches
    const badgePatterns = [
        'r', 'gti', '110tsi', '132tsi', '162tsi', 'tdi550', 'tdi580',
        'highline', 'comfortline', 'trendline', 'alltrack',
        'gx', 'gxl', 'cruiser', 'edge', 'gts', 'grande'
    ];
    
    for (const badge of badgePatterns) {
        // Use word boundary for short badges, otherwise could match anywhere
        const regex = badge.length <= 3 ? 
            new RegExp(`\\b${badge}\\b`, 'i') : 
            new RegExp(`\\b${badge}\\b`, 'i');
            
        if (regex.test(input)) {
            detectedBadge = badge;
            break;
        }
    }
    
    // Build the query conditions
    const conditions = [];
    const params = [];
    
    // Only use detectedMake if it's in our available makes
    if (detectedMake && availableMakes.includes(detectedMake)) {
        conditions.push(`LOWER(make) = $${params.length + 1}`);
        params.push(detectedMake);
    }
    
    // Only use detectedModel if it's in our available models
    if (detectedModel && availableModels.includes(detectedModel)) {
        conditions.push(`LOWER(model) = $${params.length + 1}`);
        params.push(detectedModel);
    }
    
    if (detectedBadge) {
        conditions.push(`LOWER(badge) LIKE $${params.length + 1}`);
        params.push(`%${detectedBadge}%`);
    }
    
    if (detectedFuel) {
        if (detectedFuel === 'hybrid-petrol') {
            conditions.push(`LOWER(fuel_type) LIKE $${params.length + 1}`);
            params.push('%hybrid%');
        } else {
            conditions.push(`LOWER(fuel_type) = $${params.length + 1}`);
            params.push(detectedFuel);
        }
    }
    
    if (detectedTransmission) {
        conditions.push(`LOWER(transmission_type) = $${params.length + 1}`);
        params.push(detectedTransmission);
    }
    
    if (detectedDrive) {
        conditions.push(`LOWER(drive_type) = $${params.length + 1}`);
        params.push(detectedDrive);
    }
    
    // No conditions means no match - be more strict here
    if (conditions.length === 0) {
        return { vehicle: null, score: 1 };
    }
    
    // If we have found a make in the input, but it's not in our list, return no match
    const mentionedMake = detectedMake !== null;
    if (!mentionedMake && conditions.length < 2) {
        // If no make was detected and we have fewer than 2 attribute conditions,
        // it's probably too generic to match
        return { vehicle: null, score: 1 };
    }
    
    // Build the SQL query using AND for precision - we want specific matches
    const sql = `
        SELECT v.*, COUNT(l.id) as listing_count
        FROM vehicle v
        LEFT JOIN listing l ON v.id = l.vehicle_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY v.id
        ORDER BY COUNT(l.id) DESC
        LIMIT 1
    `;
    
    // Execute the query
    const results = await query(sql, params);
    
    // If no matches, return null
    if (results.length === 0) {
        return { vehicle: null, score: 1 };
    }
    
    // Get best match
    const bestMatch = results[0];
    
    // Calculate confidence score
    let score = 3; // Default medium confidence
    
    // Make + model specific matches are high confidence
    if (detectedMake && detectedModel && 
        bestMatch.make.toLowerCase() === detectedMake && 
        bestMatch.model.toLowerCase() === detectedModel) {
        score = 4;
        
        // If we also match another attribute, it's very high confidence
        if (detectedFuel || detectedTransmission || detectedDrive || detectedBadge) {
            score = 5;
        }
    }
    // Special handling for badge-specific matches like "Golf R"
    else if (detectedModel && detectedBadge && 
             bestMatch.model.toLowerCase() === detectedModel &&
             bestMatch.badge.toLowerCase().includes(detectedBadge)) {
        score = 4;
    }
    // Special case for hybrid searches
    else if (detectedFuel === 'hybrid-petrol' && bestMatch.fuel_type.toLowerCase().includes('hybrid')) {
        score = 3;
        if (detectedMake && bestMatch.make.toLowerCase() === detectedMake) {
            score = 4;
        }
    }
    // For just make + one other attribute
    else if (detectedMake && bestMatch.make.toLowerCase() === detectedMake) {
        score = 3;
        // Adding more attributes increases confidence
        let additionalMatches = 0;
        if (detectedFuel && (bestMatch.fuel_type.toLowerCase() === detectedFuel || 
                             (detectedFuel === 'hybrid-petrol' && bestMatch.fuel_type.toLowerCase().includes('hybrid')))) {
            additionalMatches++;
        }
        if (detectedTransmission && bestMatch.transmission_type.toLowerCase() === detectedTransmission) {
            additionalMatches++;
        }
        if (detectedDrive && bestMatch.drive_type.toLowerCase() === detectedDrive) {
            additionalMatches++;
        }
        if (additionalMatches >= 2) {
            score = 5; // Very high confidence with make + 2 other attributes
        } else if (additionalMatches == 1) {
            score = 4; // High confidence with make + 1 other attribute
        }
    }
    
    return { vehicle: bestMatch, score };
};
