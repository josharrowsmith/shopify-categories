import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";

export default async function graphqlRetriever(session, query) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    const response = await client.query({ data: query });
    return response;
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
