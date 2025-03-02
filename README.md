inputs: [
'2019 Volkswagen Polo Automatic',
'2019 Volkswagen Polo 85TSI Automatic',
'2019 Volkswagen Polo Gasoline',
]

query:
- 



Requirements:

You must write an algorithm that can find a matching Vehicle ID given a plain text input.

The plain text input may not contain the full details of a vehicle - for example the trim, fuel_Type, etc might be missing. In the case where ifnromation is missing, you myst try and find the most likely vehicle match by following these business rules:

- Identify any vehicles which match the properties that **are** specified in the input description (for example, if the input specifies that the car is Petrol, you can filter out any vehicles which have a different fuel type)
- If there are multiple vehicles which you find to be the most likely match, you should return the vehicle which has the most listings.


You must return a vehicle match score between 1 and 5, where 1 indicates a low-confidence match and 5 indicates a certain match.

Your solution must be in the form of a Python or Node.js program. You will find a SQL script attached with this code challenge, you must load this data into a Postgres database and query it from within your program. You should not edit the SQL data. You can use a combination of regular expressions, sql and standard algorithms/logic to match the vehicles. Your program should print the vehicle match response for each of the provided test cases.