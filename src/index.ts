import { findBestVehicleMatch } from './matcher';

const testCases = [
    "I'm looking for a Honda Accord Petrol",
    "Need a Toyota Corolla",
    "I want a Hybrid vehicle, make doesn't matter",
    "A Ford Mustang Diesel",
    "A BMW sedan"
];

(async () => {
    for (const testCase of testCases) {
        const { vehicle, score } = await findBestVehicleMatch(testCase);
        if (vehicle) {
            console.log(`✅ Match found for "${testCase}":`);
            console.log(`   - Vehicle ID: ${vehicle.id}`);
            console.log(`   - Make: ${vehicle.make}, Model: ${vehicle.model}, Badge: ${vehicle.badge}`);
            console.log(`   - Fuel Type: ${vehicle.fuel_type}, Transmission: ${vehicle.transmission_type}, Drive Type: ${vehicle.drive_type}`);
            console.log(`   - Match Score: ${score}/5`);
        } else {
            console.log(`❌ No match found for "${testCase}" (Score: ${score}/5)`);
        }
        console.log('------------------------------------------------');
    }
})();
