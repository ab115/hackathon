const fs = require('fs');

let content = fs.readFileSync('d:/scalegrad/hackathon/frontend/src/services/tourService.ts', 'utf-8');

// The onNextClick needs to be inside the popover object.
// Right now it's:
// popover: { ... },
// onNextClick: async () => { ... }
// We need to move it inside the popover object.

// Regex to match popover object and the trailing onNextClick
const regex = /(popover:\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*)\},\s*(onNextClick:\s*(?:async\s*)?\(\)\s*=>\s*\{[^}]+\})/g;

let matches = 0;
content = content.replace(regex, (match, p1, p2) => {
    matches++;
    return p1 + ',\n          ' + p2 + '\n        }';
});

console.log(`Replaced ${matches} occurrences`);
fs.writeFileSync('d:/scalegrad/hackathon/frontend/src/services/tourService.ts', content);
