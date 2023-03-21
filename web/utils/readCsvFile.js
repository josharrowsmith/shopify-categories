import fs from "fs";
import csv from "csv-parser";

export const readCsvFile = async (filepath) => {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(csv())
      .on("data", (data) => {
        // Push each row as a string to the results array
        results.push(data.category);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};
