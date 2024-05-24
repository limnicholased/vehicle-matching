import {Pool} from 'pg';

const db = new Pool({
  connectionString: 'postgresql://postgres:@localhost:5432/postgres'
});

type Vehicle = {
  id: string;
  make: string;
  model: string;
  badge: string;
  fuel_type: string;
  transmission_type: string;
  drive_type: string;
  num_listings: number;
}

const FACETS: string[] = ['make', 'model', 'badge', 'fuel_type', 'transmission_type', 'drive_type'];

function createFilterSql(filters: {[key: string]: string[]}): [string, string[]] {
  const filterSql: string[] = [];
  const vars: string[] = [];

  for (const [filterKey, filterValues] of Object.entries(filters)) {
    if (!filterValues.length) {
      continue;
    }

    if (!FACETS.includes(filterKey)) {
      console.error(`Invalid filter facet '${filterKey}' with values '${filterValues.join(', ')}', ignoring!`)
      continue;
    }

    filterSql.push(`
      AND "${filterKey}" IN (
        ${filterValues.map((_, idx) => `$${vars.length + 1 + idx}`)}
      )
    `);

    for (const value of filterValues) {
      vars.push(value);
    }
  }

  return [filterSql.join(' '), vars];
}

async function matchFacet(input: string, facet: string, filters: {[key: string]: string[]} = {}): Promise<[string[], number]> {
  if (!FACETS.includes(facet)) {
    throw new Error(`Invalid search facet '${facet}' !`)
  }

  const [filterSql, vars] = createFilterSql(filters);

  const queryRes = await db.query<{ value: string }>(`
    SELECT v.${facet} as value
    FROM vehicle v WHERE TRUE ${filterSql}
    GROUP BY 1
  `, vars);

  const results = queryRes.rows;

  if (!results.length) {
    console.error(`No results found for facet '${facet}'`)
    return null;
  }

  const matches: {match: string, score: number}[] = [];
  let maxMatchedWords = 0;

  for (const result of results) {
    const words =  result.value.split(/[\s\-]/);

    let matchingWords = 0;

    for (const word of words) {
      if (input.includes(word)) {
        matchingWords++;
      }
    }

    if (matchingWords > 0) {
      const numWords = words.length;
      const missingWords = numWords - matchingWords;

      if (numWords > maxMatchedWords) {
        maxMatchedWords = numWords;
      }

      matches.push({
        match: result.value,
        score: ((words.length - (missingWords * 1.1))) / maxMatchedWords
      });
    }
  }

  if (!matches.length) {
    return [[], 0];
  }

  const sortedMatches = matches.sort((a, b) => b.score - a.score);
  const topScore = sortedMatches[0].score;

  return [
    sortedMatches.filter((m) => m.score >= topScore).map((m) => m.match),
    topScore
  ]
}

async function matchVehicle(filters: {[key: string]: string[]}): Promise<[Vehicle | null, number]> {
  const [filterSql, vars] = createFilterSql(filters);

  const queryRes = await db.query<Vehicle>(`
    SELECT v.id, v.make, v.model, v.badge, v.fuel_type, v.transmission_type, v.drive_type, COUNT(l.id) as num_listings
    FROM vehicle v LEFT JOIN listing l ON v.id = l.vehicle_id
    WHERE TRUE ${filterSql}
    GROUP BY 1, 2, 3, 4, 5, 6, 7 ORDER BY 8 DESC
  `, vars);

  if (!queryRes.rows.length) {
    return [null, 0];
  }

  return [queryRes.rows[0], 1 / queryRes.rows.length];
}

const MATCH_INPUTS = [
  'Volkswagen Golf 110TSI Comfortline Petrol Automatic Front Wheel Drive',
  'Volkswagen Golf 132TSI Automatic',
  'Volkswagen Golf Alltrack 132TSI',
  'Toyota Camry Hybrid',
  'Volvo XC40 Recharge'
];

async function query() {
  for (const input of MATCH_INPUTS) {
    const filters: {[key: string]: string[]} = {};
    let facetScore = 0;

    for (const facet of FACETS) {
      const [matches, matchScore] = await matchFacet(input, facet, filters);

      if (matches?.length) {
        filters[facet] = matches;
        facetScore += matchScore;
      }
    }

    const [vehicle, vehicleScore] = await matchVehicle(filters);

    console.info(`${input}}`, {vehicle, score: (facetScore + vehicleScore) / (FACETS.length + 1)})
  }
}

query().then(() => console.info('Done!')).catch((err: any) => console.error('Failed to run', err))