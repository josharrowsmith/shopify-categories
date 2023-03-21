import { GraphqlQueryError } from "@shopify/shopify-api";
import metaobjectsPageCreator from "../utils/metaobjectsPageCreator.js";
import shopify from "../shopify.js";

export default async function metaobjectsCreator(
  session,
  category,
  ids,
  parentID
) {
  const client = new shopify.api.clients.Graphql({ session });

  try {
    const data = await client.query({
      data: {
        query: `mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
              metaobjectCreate(metaobject: $metaobject) {
                metaobject {
                  handle
                  id
                  parent: field(key: "parent") {
                    value
                  }
                  collection: field(key: "collection") {
                      value
                  }
                }
                userErrors {
                  field
                  message
                  code
                }
              }
            }`,
        variables: {
          metaobject: {
            type: "category",
            handle: category,
            fields: [
              {
                key: "parent",
                value: category,
              },
              {
                key: "collection",
                value: JSON.stringify(ids),
              },
            ],
          },
        },
      },
    });

    if (!data.body.data.metaobjectCreate.userErrors.length) {
      metaobjectsPageCreator(
        session,
        data.body.data.metaobjectCreate.metaobject.id,
        parentID
      );
    }
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
