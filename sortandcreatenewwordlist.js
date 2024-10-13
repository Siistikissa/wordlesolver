import {promises as fs} from 'fs';


async function sortFileData() {
  try {
    // Read the file
    const data = await fs.readFile('words.txt', 'utf8');
    
    // Split data into lines (or another delimiter as needed)
    const lines = data.split('\n');

    // Sort lines
    const sortedLines = lines.filter(lines => lines.length == 5 && /^[a-zA-Z]+$/.test(lines));

    // Join sorted lines back into a single string
    const sortedData = sortedLines.join('\n');

    // Save sorted data to a new file
    await fs.writeFile('fiveletterwords.txt', sortedData, 'utf8');
    
    console.log('Data sorted and saved to new file');
  } catch (err) {
    console.error(err);
  }
}

await sortFileData();
