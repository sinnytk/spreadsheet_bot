const fetch = require("node-fetch");
const { google } = require("googleapis");
const { client_email, private_key } = require("./credentials.json");
const spreadsheetId = "14Nv4Ye91zITrnmt0AL512tbHYpkOojv7Gpw6Ga2EUdI";

getCurrentData = async (client) => {
  const res = await client.spreadsheets.values.get({
    spreadsheetId,
    range: "A2:C", //arbitrary range to retrieve values from
  });
  let data = res.data.values;
  //sorting takes nlogn, this way
  //i can efficiently check pre-existence of element using Binary Search
  data.sort(function (a, b) {
    return a[0] - b[0];
  });
  return data;
};
register = (email, key) => {
  const jwtClient = new google.auth.JWT(email, null, key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
  const client = google.sheets({ version: "v4", auth: jwtClient });
  return client;
};
getNewData = async () => {
  //hardcoding the retrieval of new data
  //assuming a list of lists
  const newData = [[4, "Tarun", "test"]];
  return newData;
};
binarySearch = (list, elem) => {
  let high = list.length - 1;
  let low = 0;
  let mid = 0;
  let found = false;
  // make sure you change the checking criteria for existing element
  // I am assuming elem[0] is id
  while (low <= high) {
    mid = (high + low) >> 1;
    if (list[mid][0] == elem[0]) {
      found = true;
      break;
    } else if (list[mid][0] > elem[0]) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return found;
};
filterData = (currentData, newData) => {
  console.log(currentData);
  let filtered = [];
  //iterate over elements of newData
  for (const elem of newData) {
    //binary search for previous existence of new element
    const found = binarySearch(currentData, elem);
    // if the elem already exists, continue
    if (found) continue;
    // else append the element at end of list the record
    filtered.push(elem);
  }
  console.log(filtered);
  return filtered;
};
writeData = (client, filteredData) => {
  if (filteredData.length !== 0) {
    client.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: "Sheet1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: {
        values: filteredData,
      },
    });
  }
  console.log(`${filteredData.length} rows written.`);
};
main = async () => {
  const client = await register(client_email, private_key);
  const currentData = await getCurrentData(client);
  const newData = await getNewData();
  const filteredData = filterData(currentData, newData);
  writeData(client, filteredData);
};

main();
