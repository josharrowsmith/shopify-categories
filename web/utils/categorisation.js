function getParent(str) {
  const splitArr = str.split(">");
  if (splitArr.length > 1) {
    return splitArr[splitArr.length - 2];
  } else {
    return null;
  }
}

export default function groupByLevel(arr) {
  const result = {};

  for (const str of arr) {
    const splitArr = str.split(">").map((item) => item.trim());
    const item = splitArr.pop();
    const parent = getParent(str);

    if (!result[parent]) {
      result[parent] = [];
    }

    if (parent) {
      result[parent] = [...result[parent], item];
    } else {
      result[item] = [...(result[item] || []), ...splitArr];
    }
  }

  return result;
}
