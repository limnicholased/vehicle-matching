import { findBestVehicleMatch } from './matcher';
import { testGroups, testCases, TestDefinition } from './tests';

(async () => {
  let totalTests = 0;
  let passedTests = 0;
  
  console.log("🧪 Running Vehicle Matcher Tests\n");
  
  // Run tests by group for cleaner output
  for (const [groupName, tests] of Object.entries(testGroups)) {
    console.log(`\n📋 Test Group: ${groupName}`);
    console.log("=".repeat(groupName.length + 13));
    
    for (const test of tests) {
      totalTests++;
      let passed = true;
      
      const { vehicle, score } = await findBestVehicleMatch(test.query);
      
      // Check if match status aligns with expectation
      if (test.expected.shouldMatch && !vehicle) {
        passed = false;
      } else if (!test.expected.shouldMatch && vehicle) {
        passed = false;
      }
      
      // For matches, check make/model/score expectations
      if (vehicle && test.expected.shouldMatch) {
        if (test.expected.expectedMake && vehicle.make.toLowerCase() !== test.expected.expectedMake.toLowerCase()) {
          passed = false;
        }
        if (test.expected.expectedModel && vehicle.model.toLowerCase() !== test.expected.expectedModel.toLowerCase()) {
          passed = false;
        }
        if (test.expected.minScore && score < test.expected.minScore) {
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
      console.log(`   Query: "${test.query}"`);
      if (vehicle) {
        console.log(`   - Make: ${vehicle.make}, Model: ${vehicle.model}, Badge: ${vehicle.badge}`);
        console.log(`   - Fuel: ${vehicle.fuel_type}, Transmission: ${vehicle.transmission_type}`);
        console.log(`   - Score: ${score}/5`);
      } else {
        console.log(`   - No match found (Score: ${score}/5)`);
      }
    }
  }
  
  // Calculate and display test coverage
  const passRate = (passedTests / totalTests) * 100;
  console.log("\n\n📊 Test Results Summary");
  console.log("=======================");
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed Tests: ${passedTests}`);
  console.log(`Failed Tests: ${totalTests - passedTests}`);
  console.log(`Pass Rate: ${passRate.toFixed(2)}%`);
  
  if (passRate === 100) {
    console.log("\n🎉 ALL TESTS PASSED! Vehicle matcher is working perfectly.");
  } else if (passRate >= 90) {
    console.log("\n✅ EXCELLENT COVERAGE: Vehicle matcher is working very well with minor issues.");
  } else if (passRate >= 80) {
    console.log("\n✅ GOOD COVERAGE: Vehicle matcher is working well but has some issues.");
  } else if (passRate >= 50) {
    console.log("\n⚠️ MODERATE COVERAGE: Vehicle matcher needs improvement.");
  } else {
    console.log("\n❌ POOR COVERAGE: Vehicle matcher has significant issues.");
  }
})();
