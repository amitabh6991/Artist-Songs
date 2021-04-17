let puppeteer = require("puppeteer");
let fs = require("fs");
let path = require("path");
let xlsx = require("xlsx");

// input Artist name
let artistName = process.argv[2];

let folderPath = path.join(__dirname, artistName);
dirCreater(folderPath);

// Directory creater 
function dirCreater(folderPath) {
  if (fs.existsSync(folderPath) == false) {
    fs.mkdirSync(folderPath);
  }
}
let songname = "Songs";
let filePath = path.join(folderPath, songname + ".xlsx");

// fetch one by one object
// call to excel process 
function arrayobject(myonject) {
  for (let i = 0; i < myonject.length; i++) {
    excelProcess(myonject[i]);
  }
}
// content ==> push ,read ,write function
function excelProcess(matchobj) {
  let content = excelReader(filePath, songname);
  content.push(matchobj);
  excelWriter(filePath, content, songname);
}

// excel Reader
function excelReader(filePath, songname) {
  if (!fs.existsSync(filePath)) {
    return [];
  } else {
    // workbook => excel
    let wt = xlsx.readFile(filePath);
    // csk -> msd
    // get data from workbook
    let excelData = wt.Sheets[songname];
    // convert excel format to json => array of obj
    let ans = xlsx.utils.sheet_to_json(excelData);
    // console.log(ans);
    return ans;
  }
}
// excel writer
function excelWriter(filePath, json, name) {
  // console.log(xlsx.readFile(filePath));
  let newWB = xlsx.utils.book_new();
  // console.log(json);
  let newWS = xlsx.utils.json_to_sheet(json);
  // msd.xlsx-> msd
  //workbook name as param
  xlsx.utils.book_append_sheet(newWB, newWS, name);
  //   file => create , replace
  //    replace
  xlsx.writeFile(newWB, filePath);
}

let links = [
  "https://www.jiosaavn.com/",
  "https://wynk.in/",
  "https://gaana.com/",
];

console.log("Before");
(async function () {
  try {
    let browserInstance = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });

    let savanArr = await getListingFromSavan(links[0], browserInstance, artistName);

    let wynakArr = await getListingFromWynak(links[1], browserInstance, artistName);
    let ganaArr = await getListingFromGana(links[2], browserInstance, artistName);
    await arrayobject(savanArr);
    await arrayobject(wynakArr);
    await arrayobject(ganaArr);
    console.table(savanArr);
    console.table(wynakArr);
    console.table(ganaArr);
    // console.log(savanArr);
    // console.log(wynkArr);
    // console.log(ganaArr);
  } catch (err) {
    console.log(err);
  }
})();

//jioSavan
async function getListingFromSavan(link, browserInstance, artistName) {
  let newTab = await browserInstance.newPage();
  await newTab.goto(link);
  await newTab.type("input[type='text']", artistName, { delay: 400 });
  await newTab.keyboard.press("Enter");
  await newTab.waitForSelector(
    ".o-flag.o-flag--action.o-flag--stretch.o-flag--mini h4 a",
    { visible: true }
  );
  return newTab.evaluate(
    consoleFn,
    ".o-flag.o-flag--action.o-flag--stretch.o-flag--mini h4 a"
  );
}
function consoleFn(songnameSelector) {
  let songArr = document.querySelectorAll(songnameSelector);
  let details = [];
  for (let i = 0; i < 10; i++) {
    let song = songArr[i].textContent;
    let link = songArr[i].href;
    details.push({
      song,
      link,
    });
  }
  return details;
}

// wynak music
async function getListingFromWynak(link, browserInstance, artistName) {
  let newTab = await browserInstance.newPage();
  await newTab.goto(link);
  await newTab.type("#searchinput", artistName, { delay: 400 });
  await newTab.keyboard.press("Enter");
  await newTab.waitForSelector(".defaultBg.border-radius-10.rounded-circle", {
    visible: true,
  });
  await newTab.click(".defaultBg.border-radius-10.rounded-circle");
  await newTab.waitForSelector(
    ".dark-text-color.w-100.float-left.text-truncate",
    { visible: true }
  );

  return newTab.evaluate(
    consoleFn1,
    ".dark-text-color.w-100.float-left.text-truncate"
  );
}
function consoleFn1(songnameSelector) {
  let songArr = document.querySelectorAll(songnameSelector);
  let details = [];
  for (let i = 0; i < 10; i++) {
    let song = songArr[i].textContent;
    let link = songArr[i].href;
    details.push({
      song,
      link,
    });
  }

  return details;
}
// gana
async function getListingFromGana(link, browserInstance, artistName) {
  let newTab = await browserInstance.newPage();
  await newTab.goto(link);
  await newTab.type("#sb", artistName, { delay: 400 });
  await newTab.keyboard.press("Enter");
  await newTab.waitForSelector(".imghover.not_premium .img ", {
    visible: true,
  });
  await newTab.click(".imghover.not_premium .img ");
  await newTab.waitForSelector(".playlist_thumb_det .sng_c", { visible: true });

  return newTab.evaluate(consoleFn2, ".playlist_thumb_det .sng_c");
}
function consoleFn2(songnameSelector) {
  let songArr = document.querySelectorAll(songnameSelector);
  let details = [];
  for (let i = 0; i < 10; i++) {
    let song = songArr[i].textContent;
    let link = songArr[i].href;
    details.push({
      song,
      link,
    });
    //excelProcess(song, link);
  }
  return details;
}
