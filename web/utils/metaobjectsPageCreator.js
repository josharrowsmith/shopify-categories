import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";

export default async function metaobjectsPageCreator(session, id, parentID) {
  try {
    const page = await shopify.api.rest.CustomCollection.find({
      session: session,
      id: parentID.split("/")[4],
    });
    page.metafields = [
      {
        key: "category",
        value: id,
        type: "mixed_reference",
        namespace: "custom",
      },
    ];
    await page.save({
      update: true,
    });
    return page;
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
