# Vehicle Matching Algorithm

A TypeScript implementation of a vehicle matching algorithm that finds the most likely vehicle given a plain text description.

## Input Examples

inputs: [
'2019 Volkswagen Polo Automatic',
'2019 Volkswagen Polo 85TSI Automatic',
'2019 Volkswagen Polo Gasoline',
]

## Requirements

This algorithm finds a matching Vehicle ID given a plain text input.

The plain text input may not contain the full details of a vehicle - for example the trim, fuel_type, etc. might be missing. In cases where information is missing, the algorithm finds the most likely vehicle match by following these business rules:

- Identify any vehicles which match the properties that **are** specified in the input description (for example, if the input specifies that the car is Petrol, it filters out any vehicles which have a different fuel type)
- If there are multiple vehicles which are likely matches, it returns the vehicle which has the most listings.

The algorithm returns a vehicle match score between 1 and 5, where 1 indicates a low-confidence match and 5 indicates a certain match.

## How to Use

1. **Setup the Database**
   - Load the provided SQL data in `data/data.sql` into a PostgreSQL database
   - The database connection settings can be configured in `src/db.ts`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Matcher**
   ```bash
   npx ts-node src/index.ts
   ```

4. **Matcher Output**
   - The program will run through a series of test cases
   - For each test, it will output:
     - Whether a match was found
     - Details of the matched vehicle (if any)
     - A confidence score from 1-5
     - The overall test pass rate

## Implementation Details

The solution is implemented in TypeScript/Node.js and queries a Postgres database. The matching algorithm uses a combination of:

1. Text normalization to handle variations in input descriptions
2. Database attribute matching for make, model, fuel type, etc.
3. Confidence scoring based on the specificity and accuracy of the match
4. Prioritization of vehicles with more listings when multiple matches exist

The code is designed to be robust and adapt to different vehicle data beyond the test cases.