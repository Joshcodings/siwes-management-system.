import { seedCompanies } from '../src/companies_list.ts';

console.log('Total companies in seedCompanies:', seedCompanies.length);
const names = seedCompanies.map(c => c.name.toLowerCase().trim());
const uniqueNames = new Set(names);
console.log('Unique company names count:', uniqueNames.size);

// Print all company names and their frequencies
const freq: Record<string, number> = {};
for (const name of names) {
  freq[name] = (freq[name] || 0) + 1;
}

console.log('\nDuplicates:');
for (const [name, count] of Object.entries(freq)) {
  if (count > 1) {
    console.log(`- "${name}": ${count} times`);
  }
}
