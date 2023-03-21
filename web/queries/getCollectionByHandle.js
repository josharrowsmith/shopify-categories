import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";

export default async function getCollectionByHandle(session, handle) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    const data = await client.query({
      data: {
        query: `query collectionByHandle($handle: String!) {
                collectionByHandle(handle: $handle){
                  id,
                  legacyResourceId,
                  handle
                }
              }`,
        variables: {
          handle: handle,
        },
      },
    });
    return data.body.data.collectionByHandle.id;
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
