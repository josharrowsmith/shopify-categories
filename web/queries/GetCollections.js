export const GetCollections = `query {
    collections(first: 100) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }`;
