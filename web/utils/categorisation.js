function getParent(str) {
  const splitArr = str.split(">");
  const parentArr = [];

  for (let i = 0; i < splitArr.length - 1; i++) {
    parentArr.push({
      level: i + 1,
      name: splitArr[i].trim()
    });
  }

  return parentArr;
}

export default function groupByLevel(arr) {
  const result = [];

  for (const str of arr) {
    const splitArr = str.split(">").map((item) => item.trim());
    const item = splitArr.pop();
    const parentArr = getParent(str);

    const grandparent = parentArr.length >= 2 ? parentArr[parentArr.length - 2].name : null;
    const parent = parentArr.length >= 1 ? parentArr[parentArr.length - 1].name : null;

    const children = parent ? [item] : [];
    result.push({
      Grandparent: grandparent,
      Parent: parent,
      children: children
    });
  }

  // Group by parent level
  const groupedResult = result.reduce((acc, curr) => {
    const key = curr.Parent || curr.Grandparent;
    const group = acc[key] || { Grandparent: curr.Grandparent, Parent: curr.Parent, children: [] };
    group.children = [...group.children, ...curr.children];
    acc[key] = group;
    return acc;
  }, {});

  // Filter out invalid groups
  const filteredResult = Object.values(groupedResult).filter((group) => {
    const grandparent = group.Grandparent || "";
    const parent = group.Parent || "";
    const children = group.children || [];
    return grandparent !== parent && parent !== "" && !children.includes(parent);
  });

  return filteredResult;
}