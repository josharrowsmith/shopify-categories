import { GraphqlQueryError } from "@shopify/shopify-api";
import metaobjectsPageCreator from "../utils/metaobjectsPageCreator.js";
import shopify from "../shopify.js";

export default async function metaobjectsCreator(
  session,
  grandParent,
  category,
  ids,
  parentID
) {
  const client = new shopify.api.clients.Graphql({ session });

  const GrandParent = grandParent ? grandParent : "";

  console.log(ids);

  try {
    const data = await client.query({
      data: {
        query: `mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
              metaobjectCreate(metaobject: $metaobject) {
                metaobject {
                  handle
                  id
                  grandparent: field(key: "grandparent") {
                    value
                  }
                  parent: field(key: "parent") {
                    value
                  }
                  subcollection: field(key: "collection") {
                    value
                  }
                  capabilities {
                    publishable {
                      status
                    }
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
            capabilities: {
              publishable: {
                status: "ACTIVE",
              },
            },
            fields: [
              {
                key: "grandparent",
                value: GrandParent,
              },
              {
                key: "parent",
                value: category,
              },
              {
                key: "subcollection",
                value: JSON.stringify(ids),
              },
            ],
          },
        },
      },
    });

    console.log(JSON.stringify(data.body.data));

    // if (!data.body.data.metaobjectCreate.userErrors.length) {
    //   metaobjectsPageCreator(
    //     session,
    //     data.body.data.metaobjectCreate.metaobject.id,
    //     parentID
    //   );
    // }
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
