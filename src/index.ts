import { findBestVehicleMatch } from './matcher';

interface TestCase {
  description: string;
  query: string;
  expected: {
    shouldMatch: boolean;
    expectedVehicleId?: string;
    expectedMake?: string;
    expectedModel?: string;
    minScore?: number;
  };
}

const testCases: TestCase[] = [
  // Examples from README
  {
    description: "Volkswagen Polo Automatic (Polo not in database)",
    query: "2019 Volkswagen Polo Automatic",
    expected: { shouldMatch: false }
  },
  {
    description: "Volkswagen Polo with badge (Polo not in database)",
    query: "2019 Volkswagen Polo 85TSI Automatic",
    expected: { shouldMatch: false }
  },
  {
    description: "Volkswagen Polo with Gasoline (Polo not in database)",
    query: "2019 Volkswagen Polo Gasoline",
    expected: { shouldMatch: false }
  },
  
  // Original test cases
  {
    description: "Honda not in database",
    query: "I'm looking for a Honda Accord Petrol",
    expected: { shouldMatch: false }
  },
  {
    description: "Toyota Corolla not in database",
    query: "Need a Toyota Corolla",
    expected: { shouldMatch: false }
  },
  {
    description: "Hybrid vehicle should match Toyota with hybrid",
    query: "I want a Hybrid vehicle, make doesn't matter",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      minScore: 3 
    }
  },
  {
    description: "Ford not in database",
    query: "A Ford Mustang Diesel",
    expected: { shouldMatch: false }
  },
  {
    description: "BMW not in database",
    query: "A BMW sedan",
    expected: { shouldMatch: false }
  },
  
  // Specific vehicle tests - VW Golf variants
  {
    description: "Basic VW Golf",
    query: "I need a Volkswagen Golf",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Golf",
      minScore: 4 
    }
  },
  {
    description: "Golf R specific model",
    query: "Looking for a Golf R",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Golf", 
      minScore: 4 
    }
  },
  {
    description: "Golf GTI specific model",
    query: "VW Golf GTI",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Golf", 
      minScore: 4 
    }
  },
  
  // Toyota RAV4 variants
  {
    description: "Basic Toyota RAV4",
    query: "Looking for a Toyota RAV4",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      expectedModel: "RAV4", 
      minScore: 4 
    }
  },
  {
    description: "RAV4 with hybrid fuel specified",
    query: "I want a RAV4 with Hybrid-Petrol fuel",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      expectedModel: "RAV4", 
      minScore: 4 
    }
  },
  {
    description: "RAV4 with AWD specified",
    query: "RAV4 with Four Wheel Drive",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      expectedModel: "RAV4", 
      minScore: 3 
    }
  },
  
  // Volkswagen Amarok
  {
    description: "Amarok with diesel engine",
    query: "Volkswagen Amarok with Diesel engine",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Amarok", 
      minScore: 5 
    }
  },
  
  // Toyota Camry variants
  {
    description: "Toyota Camry Hybrid",
    query: "Toyota Camry Hybrid",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      expectedModel: "Camry", 
      minScore: 5 
    }
  },
  
  // Toyota Kluger
  {
    description: "Automatic Toyota Kluger",
    query: "Automatic Toyota Kluger",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      expectedModel: "Kluger", 
      minScore: 5 
    }
  },
  
  // Toyota 86
  {
    description: "Toyota 86 with Manual transmission",
    query: "Toyota 86 with Manual transmission",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      expectedModel: "86", 
      minScore: 5 
    }
  },
  
  // VW Tiguan variants
  {
    description: "Volkswagen Tiguan 4WD",
    query: "Volkswagen Tiguan 4WD",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Tiguan", 
      minScore: 4 
    }
  },
  {
    description: "Tiguan 162TSI Highline specific badge",
    query: "Volkswagen Tiguan 162TSI Highline",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Tiguan", 
      minScore: 4 
    }
  },
  
  // Generic queries with multiple attributes
  {
    description: "Toyota with Four Wheel Drive",
    query: "Toyota with Four Wheel Drive",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Toyota", 
      minScore: 3 
    }
  },
  {
    description: "VW with auto transmission and petrol",
    query: "Volkswagen with Automatic transmission and Petrol engine",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      minScore: 4 
    }
  },
  
  // Edge cases
  {
    description: "Very specific complex query",
    query: "I need a Volkswagen Golf R with Automatic transmission and Petrol engine with 4WD",
    expected: { 
      shouldMatch: true, 
      expectedMake: "Volkswagen", 
      expectedModel: "Golf", 
      minScore: 5 
    }
  }
];

(async () => {
  let totalTests = testCases.length;
  let passedTests = 0;
  
  console.log("🔍 Running Vehicle Matching Test Suite");
  console.log("=======================================");
  
  for (const test of testCases) {
    const { vehicle, score } = await findBestVehicleMatch(test.query);
    let passed = false;
    
    // Check if result matches expectations
    if (!test.expected.shouldMatch && !vehicle) {
      passed = true;
    } else if (test.expected.shouldMatch && vehicle) {
      passed = true;
      
      // Additional validations for specific expectations
      if (test.expected.expectedMake && vehicle.make !== test.expected.expectedMake) {
        passed = false;
      }
      if (test.expected.expectedModel && vehicle.model !== test.expected.expectedModel) {
        passed = false;
      }
      if (test.expected.minScore && score < test.expected.minScore) {
        passed = false;
      }
      if (test.expected.expectedVehicleId && vehicle.id !== test.expected.expectedVehicleId) {
        passed = false;
      }
    }
    
    if (passed) {
      passedTests++;
      console.log(`✅ PASS: ${test.description}`);
    } else {
      console.log(`❌ FAIL: ${test.description}`);
    }
    
    // Log details of the match
    if (vehicle) {
      console.log(`   Query: "${test.query}"`);
      console.log(`   - Vehicle ID: ${vehicle.id}`);
      console.log(`   - Make: ${vehicle.make}, Model: ${vehicle.model}, Badge: ${vehicle.badge}`);
      console.log(`   - Fuel Type: ${vehicle.fuel_type}, Transmission: ${vehicle.transmission_type}, Drive Type: ${vehicle.drive_type}`);
      console.log(`   - Match Score: ${score}/5`);
    } else {
      console.log(`   Query: "${test.query}"`);
      console.log(`   - No match found (Score: ${score}/5)`);
    }
    console.log('------------------------------------------------');
  }
  
  // Calculate and display test coverage
  const passRate = (passedTests / totalTests) * 100;
  console.log("\n📊 Test Results Summary");
  console.log("=======================");
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${passedTests}`);
  console.log(`Failed Tests: ${totalTests - passedTests}`);
  console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
  
  if (passRate === 100) {
    console.log("\n🎉 ALL TESTS PASSED! Vehicle matcher is working perfectly.");
  } else if (passRate >= 80) {
    console.log("\n✅ GOOD COVERAGE: Vehicle matcher is working well but has some issues.");
  } else if (passRate >= 50) {
    console.log("\n⚠️ MODERATE COVERAGE: Vehicle matcher needs improvement.");
  } else {
    console.log("\n❌ POOR COVERAGE: Vehicle matcher has significant issues.");
  }
})();
