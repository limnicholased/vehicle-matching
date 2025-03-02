// Define test cases in a more compact structure
export interface TestDefinition {
  description: string;
  query: string;
  expected: {
    shouldMatch: boolean;
    expectedMake?: string;
    expectedModel?: string;
    minScore?: number;
  };
}

// Helper function to generate test cases based on patterns
export function generateTests(pattern: string, options: { 
  variants: string[]; 
  shouldMatch: boolean;
  expectedMake?: string;
  expectedModel?: string;
  minScore?: number;
}): TestDefinition[] {
  return options.variants.map(variant => ({
    description: `${pattern}: ${variant}`,
    query: variant,
    expected: {
      shouldMatch: options.shouldMatch,
      expectedMake: options.expectedMake,
      expectedModel: options.expectedModel,
      minScore: options.minScore
    }
  }));
}

// Groups of test cases
export const testGroups: { [key: string]: TestDefinition[] } = {
  // Test vehicles not in database
  "Vehicles Not in Database": [
    ...generateTests("Non-existing make", {
      variants: [
        "I'm looking for a Honda Accord Petrol",
        "Need a Toyota Corolla",
        "A Ford Mustang Diesel",
        "A BMW sedan"
      ],
      shouldMatch: false
    }),
    ...generateTests("Volkswagen model not in DB", {
      variants: [
        "2019 Volkswagen Polo Automatic",
        "2019 Volkswagen Polo 85TSI Automatic",
        "2019 Volkswagen Polo Gasoline"
      ],
      shouldMatch: false
    }),
    ...generateTests("Other non-existing vehicles", {
      variants: [
        "Mazda CX-5 Turbo AWD",
        "Hyundai i30 N Performance",
        "Kia Stinger GT",
        "Nissan Leaf Electric"
      ],
      shouldMatch: false
    })
  ],
  
  // Hybrid vehicle tests
  "Hybrid Vehicles": [
    ...generateTests("Generic hybrid", {
      variants: [
        "I want a Hybrid vehicle, make doesn't matter", 
        "Looking for a hybrid car",
        "Show me hybrid options"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      minScore: 3
    }),
    ...generateTests("Toyota hybrid", {
      variants: [
        "Toyota Camry Hybrid",
        "Hybrid Toyota Camry"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      expectedModel: "Camry",
      minScore: 4
    }),
    ...generateTests("Alternative hybrid phrasing", {
      variants: [
        "I need a car with hybrid technology",
        "Vehicle with hybrid engine",
        "Eco-friendly hybrid automobile"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      minScore: 3
    })
  ],
  
  // Volkswagen tests
  "Volkswagen Models": [
    ...generateTests("VW Golf", {
      variants: [
        "Volkswagen Golf Automatic Petrol",
        "VW Golf petrol auto",
        "I want a Golf with automatic transmission"
      ],
      shouldMatch: true,
      expectedMake: "Volkswagen",
      expectedModel: "Golf",
      minScore: 4
    }),
    
    ...generateTests("VW Golf with badge", {
      variants: [
        "Volkswagen Golf R", 
        "VW Golf GTI"
      ],
      shouldMatch: true,
      expectedMake: "Volkswagen",
      expectedModel: "Golf",
      minScore: 4
    }),
    
    ...generateTests("VW Tiguan", {
      variants: [
        "Volkswagen Tiguan 162TSI",
        "VW Tiguan Diesel"
      ],
      shouldMatch: true,
      expectedMake: "Volkswagen",
      expectedModel: "Tiguan",
      minScore: 4
    }),
    
    ...generateTests("VW alternative spellings", {
      variants: [
        "VolksWagen Golf",
        "Volks Wagen Golf",
        "Volkswagon Golf" 
      ],
      shouldMatch: true,
      expectedMake: "Volkswagen",
      expectedModel: "Golf",
      minScore: 3
    }),
    
    ...generateTests("VW with specific transmissions", {
      variants: [
        "Manual Volkswagen Golf",
        "Golf with a stick shift",
        "Automatic Golf from VW"
      ],
      shouldMatch: true,
      expectedMake: "Volkswagen",
      expectedModel: "Golf",
      minScore: 4
    })
  ],
  
  // Toyota tests
  "Toyota Models": [
    ...generateTests("Toyota RAV4", {
      variants: [
        "Toyota RAV4 GXL",
        "RAV4 with AWD"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      expectedModel: "RAV4",
      minScore: 4
    }),
    
    ...generateTests("Toyota RAV4 Hybrid", {
      variants: [
        "Toyota RAV4 with Hybrid-Petrol fuel",
        "Hybrid RAV4 from Toyota"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      expectedModel: "RAV4",
      minScore: 4
    }),
    
    ...generateTests("Toyota Camry variants", {
      variants: [
        "Toyota Camry Hybrid",
        "Camry Petrol Automatic",
        "Toyota Camry SL V6"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      expectedModel: "Camry",
      minScore: 4
    }),
    
    ...generateTests("Toyota 86 sports car", {
      variants: [
        "Toyota 86 GTS",
        "86 sports car from Toyota",
        "Manual Toyota 86"
      ],
      shouldMatch: true,
      expectedMake: "Toyota",
      expectedModel: "86",
      minScore: 4
    })
  ],
  
  // Transmission-specific tests
  "Transmission Types": [
    ...generateTests("Manual transmission vehicles", {
      variants: [
        "Manual Volkswagen Golf",
        "Toyota 86 with manual gearbox", 
        "Stick shift Tiguan"
      ],
      shouldMatch: true,
      minScore: 3
    }),
    ...generateTests("Automatic transmission vehicles", {
      variants: [
        "Automatic transmission Toyota Camry",
        "Golf with auto gearbox",
        "RAV4 with automatic"
      ],
      shouldMatch: true,
      minScore: 3
    })
  ],
  
  // Fuel type tests  
  "Fuel Types": [
    ...generateTests("Diesel vehicles", {
      variants: [
        "Diesel Volkswagen Tiguan",
        "VW with diesel engine", 
        "TDI Volkswagen"
      ],
      shouldMatch: true,
      expectedMake: "Volkswagen",
      minScore: 3
    }),
    ...generateTests("Petrol vehicles", {
      variants: [
        "Petrol Toyota Camry",
        "Gasoline Golf",
        "VW with petrol engine"
      ],
      shouldMatch: true,
      minScore: 3
    })
  ],
  
  // Drive type tests
  "Drive Types": [
    ...generateTests("All-wheel drive vehicles", {
      variants: [
        "AWD Toyota RAV4",
        "Four wheel drive Tiguan",
        "4WD Volkswagen"
      ],
      shouldMatch: true,
      minScore: 3
    }),
    ...generateTests("Front-wheel drive vehicles", {
      variants: [
        "FWD Golf",
        "Front wheel drive Toyota",
        "Camry with front wheel drive"
      ],
      shouldMatch: true,
      minScore: 3
    })
  ],
  
  // Complex combination tests
  "Multi-attribute Searches": [
    ...generateTests("Complex vehicle specifications", {
      variants: [
        "Diesel automatic Volkswagen Tiguan AWD",
        "Toyota RAV4 Hybrid with AWD in GXL trim",
        "Manual petrol Golf GTI",
        "Four-wheel-drive hybrid Toyota with automatic transmission"
      ],
      shouldMatch: true,
      minScore: 4
    }),
    ...generateTests("Natural language queries", {
      variants: [
        "I'm looking for a fuel efficient hybrid Toyota",
        "Need an SUV with four wheel drive that's a Volkswagen",
        "Want to find a sporty Golf with manual transmission",
        "Searching for a family sized Toyota with automatic transmission"
      ],
      shouldMatch: true,
      minScore: 3
    }),
  ],
  
  // Edge cases
  "Edge Cases": [
    ...generateTests("Minimal information", {
      variants: [
        "Toyota",
        "Volkswagen",
        "Automatic",
        "Petrol vehicle"
      ],
      shouldMatch: true,
      minScore: 2
    }),
    ...generateTests("Very specific requests", {
      variants: [
        "2019 Toyota RAV4 GXL AWD Hybrid with sunroof and leather seats",
        "Volkswagen Golf R manual with performance package and 19-inch wheels",
        "Toyota 86 GTS with the TRD exhaust package and limited slip differential"
      ],
      shouldMatch: true,
      minScore: 3
    })
  ]
};

// Flatten all test cases into a single array
export const testCases: TestDefinition[] = Object.values(testGroups).flat(); 