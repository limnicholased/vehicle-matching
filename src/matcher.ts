import { query } from './db';
import {
    makeAliases,
    modelAliases,
    unknownMakes,
    unknownModels,
    badgePatterns,
    fuelTypePatterns,
    transmissionPatterns,
    driveTypePatterns,
    attributeWeights
} from './features';

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
    
    // Get database makes and models
    const makeQuery = await query('SELECT DISTINCT make FROM vehicle');
    const modelQuery = await query('SELECT DISTINCT model FROM vehicle');
    
    const availableMakes = makeQuery.map(row => row.make.toLowerCase());
    const availableModels = modelQuery.map(row => row.model.toLowerCase());
    
    // Extract make
    let detectedMake = null;
    
    // Check exact make matches
    for (const make of availableMakes) {
        const regex = new RegExp(`\\b${make}\\b`, 'i');
        if (regex.test(input)) {
            detectedMake = make;
            break;
        }
    }
    
    // Check aliases
    if (!detectedMake) {
        for (const [alias, make] of Object.entries(makeAliases)) {
            const regex = new RegExp(`\\b${alias}\\b`, 'i');
            if (regex.test(input) && availableMakes.includes(make)) {
                detectedMake = make;
                break;
            }
        }
    }
    
    // Check for known unavailable makes
    for (const make of unknownMakes) {
        const regex = new RegExp(`\\b${make}\\b`, 'i');
        if (regex.test(input)) {
            return { vehicle: null, score: 1 };
        }
    }
    
    // Extract model
    let detectedModel = null;
    
    // Check for known unavailable models
    for (const model of unknownModels) {
        const regex = new RegExp(`\\b${model}\\b`, 'i');
        if (regex.test(input)) {
            return { vehicle: null, score: 1 };
        }
    }
    
    // Check exact model matches
    for (const model of availableModels) {
        const regex = model.length <= 2 ? 
                new RegExp(`\\b${model}\\b`, 'i') : 
                new RegExp(`\\b${model}\\b`, 'i');
        if (regex.test(input)) {
            detectedModel = model;
            break;
        }
    }
    
    // Check model aliases
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
    for (const [fuelType, patterns] of Object.entries(fuelTypePatterns)) {
        if (patterns.some(pattern => input.includes(pattern))) {
            detectedFuel = fuelType;
            break;
        }
    }
    
    // Extract transmission type
    let detectedTransmission = null;
    for (const [transmissionType, patterns] of Object.entries(transmissionPatterns)) {
        if (patterns.some(pattern => input.includes(pattern))) {
            detectedTransmission = transmissionType;
            break;
        }
    }
    
    // Extract drive type
    let detectedDrive = null;
    for (const [driveType, patterns] of Object.entries(driveTypePatterns)) {
        const driveRegexes = patterns.map(pattern => new RegExp(`\\b${pattern}\\b`, 'i'));
        if (driveRegexes.some(regex => regex.test(input))) {
            detectedDrive = driveType;
            break;
        }
    }
    
    // Extract badge
    let detectedBadge = null;
    for (const badge of badgePatterns) {
        const regex = badge.length <= 3 ? 
            new RegExp(`\\b${badge}\\b`, 'i') : 
            new RegExp(`\\b${badge}\\b`, 'i');
            
        if (regex.test(input)) {
            detectedBadge = badge;
            break;
        }
    }
    
    // Build query
    const conditions = [];
    const params = [];
    let totalWeight = 0;
    
    // Add make condition
    if (detectedMake && availableMakes.includes(detectedMake)) {
        conditions.push(`LOWER(make) = $${params.length + 1}`);
        params.push(detectedMake);
        totalWeight += attributeWeights.make;
    }
    
    // Add model condition
    if (detectedModel && availableModels.includes(detectedModel)) {
        conditions.push(`LOWER(model) = $${params.length + 1}`);
        params.push(detectedModel);
        totalWeight += attributeWeights.model;
    }
    
    // Add badge condition
    if (detectedBadge) {
        conditions.push(`LOWER(badge) LIKE $${params.length + 1}`);
        params.push(`%${detectedBadge}%`);
        totalWeight += attributeWeights.badge;
    }
    
    // Add fuel condition
    if (detectedFuel) {
        if (detectedFuel === 'hybrid-petrol') {
            conditions.push(`LOWER(fuel_type) LIKE $${params.length + 1}`);
            params.push('%hybrid%');
        } else {
            conditions.push(`LOWER(fuel_type) = $${params.length + 1}`);
            params.push(detectedFuel);
        }
        totalWeight += attributeWeights.fuel_type;
    }
    
    // Add transmission condition
    if (detectedTransmission) {
        conditions.push(`LOWER(transmission_type) = $${params.length + 1}`);
        params.push(detectedTransmission);
        totalWeight += attributeWeights.transmission_type;
    }
    
    // Add drive type condition
    if (detectedDrive) {
        conditions.push(`LOWER(drive_type) = $${params.length + 1}`);
        params.push(detectedDrive);
        totalWeight += attributeWeights.drive_type;
    }
    
    // Exit if no conditions
    if (conditions.length === 0) {
        return { vehicle: null, score: 1 };
    }
    
    // Exit if query too generic
    if (!detectedMake && !detectedModel && conditions.length < 2 && !detectedFuel) {
        return { vehicle: null, score: 1 };
    }
    
    // Generate weighted SQL case expressions
    const weightCases = [];
    
    if (detectedMake) {
        weightCases.push(`CASE WHEN LOWER(make) = '${detectedMake}' THEN ${attributeWeights.make} ELSE 0 END`);
    }
    
    if (detectedModel) {
        weightCases.push(`CASE WHEN LOWER(model) = '${detectedModel}' THEN ${attributeWeights.model} ELSE 0 END`);
    }
    
    if (detectedBadge) {
        weightCases.push(`CASE WHEN LOWER(badge) LIKE '%${detectedBadge}%' THEN ${attributeWeights.badge} ELSE 0 END`);
    }
    
    if (detectedFuel) {
        if (detectedFuel === 'hybrid-petrol') {
            weightCases.push(`CASE WHEN LOWER(fuel_type) LIKE '%hybrid%' THEN ${attributeWeights.fuel_type} ELSE 0 END`);
        } else {
            weightCases.push(`CASE WHEN LOWER(fuel_type) = '${detectedFuel}' THEN ${attributeWeights.fuel_type} ELSE 0 END`);
        }
    }
    
    if (detectedTransmission) {
        weightCases.push(`CASE WHEN LOWER(transmission_type) = '${detectedTransmission}' THEN ${attributeWeights.transmission_type} ELSE 0 END`);
    }
    
    if (detectedDrive) {
        weightCases.push(`CASE WHEN LOWER(drive_type) = '${detectedDrive}' THEN ${attributeWeights.drive_type} ELSE 0 END`);
    }
    
    const weightExpression = weightCases.join(' + ');
    
    // SQL query: Finds vehicles matching all conditions, calculates match quality score
    // based on weighted attributes, and orders by match quality and popularity
    const sql = `
        SELECT 
            v.*, 
            COUNT(l.id) as listing_count,
            (${weightExpression}) AS match_weight,
            CASE WHEN ${totalWeight} > 0 THEN (${weightExpression})::float / ${totalWeight} ELSE 0 END as match_quality
        FROM vehicle v
        LEFT JOIN listing l ON v.id = l.vehicle_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY v.id
        ORDER BY match_quality DESC, COUNT(l.id) DESC
        LIMIT 1
    `;
    
    const results = await query(sql, params);
    
    // Return null if no matches
    if (results.length === 0) {
        return { vehicle: null, score: 1 };
    }
    
    // Calculate score
    const bestMatch = results[0];
    let score = 1;
    
    if (bestMatch.match_quality) {
        score = Math.min(5, Math.max(2, Math.round(bestMatch.match_quality * 4) + 1));
    }
    
    // Boost score for multiple attributes
    const attrCount = conditions.length;
    if (attrCount >= 3) {
        score = Math.min(5, score + 1);
    } else if ((detectedMake && detectedModel) || (detectedModel && detectedBadge)) {
        score = Math.min(5, score + 1);
    }
    
    return { vehicle: bestMatch, score };
};
