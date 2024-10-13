import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

// Define the filterWords function
function filterWords(words, includeLettersAtIndexes, excludeLetters, includeButNotIndexes) {
  return words.filter(word => {
    // Check for inclusion of letters at specific indexes
    for (const [letter, index] of includeLettersAtIndexes) {
      if (word[index] !== letter) return false;
    }

    // Check for exclusion of specific letters
    if (excludeLetters.some(letter => word.includes(letter))) return false;

    // Check for inclusion of letters not at specific indexes
    for (const [letter, index] of includeButNotIndexes) {
      if (!word.includes(letter) || word[index] === letter) return false;
    }

    return true;
  });
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}


(async () => {
  // Read the file containing five-letter words
  const data = await fs.readFile('fiveletterwords.txt', 'utf8').catch(err => {
    console.error(err);
    return null;
  });

  if (!data) return;
  const lowerCaseData = data.toLowerCase();
  var words = lowerCaseData.split(/\r?\n/);
  var includeLettersAtIndexes = new Array(); 
  var excludeLetters = new Array(); 
  var includeButNotIndexes = new Array(); 

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://wordly.org/', { waitUntil: 'networkidle2', timeout: 60000 });
  var quess = 'saine';
  await page.keyboard.type(quess);
  await page.keyboard.press('Enter');
  var round = 0;
  var keepPlaying = true;
  while (keepPlaying){
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Find all subclasses of the main class
  var subclasses = await page.evaluate(() => {
    const mainClassElements = document.querySelectorAll('.game_rows');
    let allSubclasses = [];
    mainClassElements.forEach(element => {
      const subclasses = Array.from(element.querySelectorAll('*')); // Get all child elements
      allSubclasses = allSubclasses.concat(subclasses);
    });
    return allSubclasses.map(element => element.className).filter(className => className); // Return class names
  });
  //console.log(subclasses)
  for (let index = 0; index < 5; index++) {
    if (subclasses[index+round+1].includes('absent')) {
      excludeLetters.push(quess[index]);
    }
    else if (subclasses[index+round+1].includes('correct')) {
      includeLettersAtIndexes.push([quess[index],index]);
    }
    else if (subclasses[index+round+1].includes('elsewhere')) {
      includeButNotIndexes.push([quess[index],index]);
    }
    
  }
  console.log(excludeLetters,includeButNotIndexes,includeLettersAtIndexes);
  var filteredWords = await filterWords(words, includeLettersAtIndexes, excludeLetters, includeButNotIndexes);
  console.log(filteredWords);
  for (let index = 0; index < 5; index++) {
    await page.keyboard.press('Backspace');
  }
  
  if (filteredWords.length === 0) {
    console.log('No more words to guess.');
    keepPlaying = false;
    break;
  }
  //await new Promise(resolve => setTimeout(resolve, 2000));
  quess = String(filteredWords[0]);
  await filteredWords.splice(0,1);
  console.log(filteredWords);
  words = filteredWords;
  await page.keyboard.type(quess);
  await page.keyboard.press('Enter');
  
  if(subclasses[round].includes('locked')){
    console.log("we got a round" + round);
    round += 6;
    excludeLetters = [];
    includeButNotIndexes = [];
    includeLettersAtIndexes = [];
  }
  if (round === 36){
    keepPlaying = false;
  }
}
  await browser.close();
})();