import fs from 'fs';
import path from 'path';

function parseDataset() {
  const content = fs.readFileSync(path.join(__dirname, '../dataset.md'), 'utf-8');
  const lines = content.split('\n');

  const results = [];
  let currentBlock = null;

  // Skip headers (first 6 lines)
  for (let i = 6; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if the current line and next line form a Name + Address pair
    // Address usually contains 'Jawa Timur', 'Kec.', 'Jl.', 'RT', etc.
    let isAddressNext = false;
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const nextLine = lines[j].trim();
      if (!nextLine) continue;
      if (nextLine.includes('Jawa Timur') || nextLine.includes('Kec.') || nextLine.includes('Jl.') || nextLine.includes('Kabupaten') || nextLine.includes('Kota')) {
        isAddressNext = true;
      }
      break;
    }

    // A Youtube link marks the definitive end of a block (or we start a new one if it looks like a new place)
    const isYoutube = line.startsWith('https://youtu') || line.startsWith('https://www.youtube');
    
    if (currentBlock && isYoutube) {
      currentBlock.video = line;
      results.push(currentBlock);
      currentBlock = null;
      continue;
    }

    if (!currentBlock) {
      // Start a new block
      currentBlock = {
        name: line,
        address: '',
        hours: '',
        price: '',
        instagram: '',
        website: '',
        video: ''
      };
      // Find the address
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (!nextLine) continue;
        currentBlock.address = nextLine;
        i = j;
        break;
      }
    } else {
      // We are inside a block, assigning fields based on content
      if (line.toLowerCase().startsWith('instagram')) {
        currentBlock.instagram = line;
      } else if (line.toLowerCase().startsWith('website') || (line.startsWith('http') && !isYoutube)) {
        currentBlock.website = line;
      } else if (line.toLowerCase().includes('wib') || line.toLowerCase().includes('hours') || line.toLowerCase().includes('jam')) {
        if (!currentBlock.hours) currentBlock.hours = line;
        else currentBlock.hours += ' ' + line;
      } else if (line.toLowerCase().includes('rp') || line.toLowerCase().includes('free') || line.toLowerCase().includes('gratis')) {
        currentBlock.price = line;
      } else if (isAddressNext) {
        // We encountered a new place before the old one had a youtube link
        results.push(currentBlock);
        currentBlock = {
          name: line,
          address: '',
          hours: '',
          price: '',
          instagram: '',
          website: '',
          video: ''
        };
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (!nextLine) continue;
          currentBlock.address = nextLine;
          i = j;
          break;
        }
      } else {
        // Unknown line, might be continuation of price or hours or unhandled case
        // Let's just log it or append to price if it looks like it
        if (!currentBlock.price && !currentBlock.hours) {
           currentBlock.hours = line; // Fallback
        } else if (!currentBlock.price) {
           currentBlock.price = line;
        }
      }
    }
  }

  if (currentBlock) {
    results.push(currentBlock);
  }

  // Ensure data dir exists
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Clean up social media strings
  results.forEach(r => {
    if (r.instagram) {
      const match = r.instagram.match(/@([a-zA-Z0-9_.]+)/);
      if (match) {
        r.instagram = `https://instagram.com/${match[1]}`;
      } else {
         // Maybe just a link
         const linkMatch = r.instagram.match(/https?:\/\/[^\s]+/);
         if (linkMatch) r.instagram = linkMatch[0];
      }
    }
    if (r.website) {
       const linkMatch = r.website.match(/https?:\/\/[^\s]+/);
       if (linkMatch) r.website = linkMatch[0];
       else {
         const clean = r.website.replace(/Website\s*:\s*/i, '').trim();
         if (clean && !clean.startsWith('http')) r.website = 'https://' + clean;
         else r.website = clean;
       }
    }
    // Clean price
    if (r.price) {
       r.price = r.price.replace(/±/g, '').trim();
    }
  });

  fs.writeFileSync(path.join(dataDir, 'place_updates.json'), JSON.stringify(results, null, 2));
  console.log(`Parsed ${results.length} places successfully.`);
}

parseDataset();
