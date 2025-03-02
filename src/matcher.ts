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
    // Extract details from input text
    const makeMatch = description.match(/\b(Honda|Toyota|Ford|BMW|Mercedes|Nissan|Chevrolet)\b/i);
    const modelMatch = description.match(/\b(Accord|Corolla|Camry|Civic|Mustang|Altima|Model S)\b/i);
    const fuelMatch = description.match(/\b(Petrol|Diesel|Electric|Hybrid|Gasoline)\b/i);

    const make = makeMatch ? makeMatch[1] : null;
    const model = modelMatch ? modelMatch[1] : null;
    const fuel = fuelMatch ? fuelMatch[1] : null;

    // Construct SQL query dynamically
    let sql = `SELECT v.*, COUNT(l.id) as listing_count
               FROM vehicle v
               LEFT JOIN listing l ON v.id = l.vehicle_id
               WHERE 1=1 `;
    const params: any[] = [];

    if (make) {
        sql += `AND v.make ILIKE $${params.length + 1} `;
        params.push(make);
    }
    if (model) {
        sql += `AND v.model ILIKE $${params.length + 1} `;
        params.push(model);
    }
    if (fuel) {
        sql += `AND v.fuel_type ILIKE $${params.length + 1} `;
        params.push(fuel);
    }

    sql += `GROUP BY v.id ORDER BY listing_count DESC LIMIT 1;`;

    const result = await query(sql, params);

    if (result.length === 0) {
        return { vehicle: null, score: 1 }; // No match found
    }

    const bestMatch = result[0];
    let matchScore = 3; // Default medium confidence

    if (make && model && fuel) {
        matchScore = 5; // Strongest match
    } else if ((make && model) || (make && fuel)) {
        matchScore = 4; // Strong match
    } else if (make || model) {
        matchScore = 2; // Weak match
    }

    return { vehicle: bestMatch, score: matchScore };
};
