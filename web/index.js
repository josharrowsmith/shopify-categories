// @ts-check
import { join } from "path";
import { readFileSync, createReadStream } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";

import graphqlRetriever from "./utils/metaobjectsRetriever.js";
import metaobjectsCreator from "./utils/metaobjectsCreator.js";
import getCollectionByHandle from "./queries/getCollectionByHandle.js";
import { GetCollections } from "./queries/GetCollections.js";
import groupStrings from "./utils/categorisation.js";
import { readCsvFile } from "./utils/readCsvFile.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/create", async (_req, res) => {
  let status = 200;
  let error = null;
  try {
    const session = res.locals.shopify.session;

    // Getiing all current collections
    const data = await graphqlRetriever(session, GetCollections);
    const collectionHandles = data.body.data.collections.edges.map(
      (e) => e.node.handle
    );

    // read csv from a export i.e neto
    const csvData = await readCsvFile("../data.csv");

    // // figure what collections need to be made
    const splitCollections = csvData.map((string) => string.split(">"));
    const flattenedCollections = splitCollections.flat();

    const uniqueCollections = [...new Set(flattenedCollections)];

    const formatedCollections = uniqueCollections.map((collection) =>
      collection.replace(/\s+/g, "-").toLowerCase()
    );

    // // filter current collections
    const createCollections = formatedCollections.filter(
      (el) => !collectionHandles.includes(el)
    );

    // create needed collections need to timeout
    createCollections.forEach(async (element) => {
      const custom_collection = new shopify.api.rest.CustomCollection({
        session: session,
      });
      custom_collection.title =
        element.charAt(0).toUpperCase() + element.substring(1);

      try {
        await custom_collection.save({
          update: true,
        });
      } catch (error) {
        console.log(error);
      }
      // hackes not working
    });

    // getting collections parent and child to link later (does include ones already made)
    const parentAndChildObject = groupStrings(csvData);

    setTimeout(() => {
      // i need to wait till collection have been made
      parentAndChildObject.map(async (i) => {
        //   // need parent ID to link ID
        const parentID = await getCollectionByHandle(
          session,
          i.Parent.replace(/\s+/g, "-").toLowerCase()
        );
        // // ids of the children collections
        const ids = await Promise.all(
          i.children.map((value) =>
            getCollectionByHandle(
              session,
              value.replace(/\s+/g, "-").toLowerCase()
            )
          )
        );
        //   // off by one because of map
        const uniqueIDS = [...new Set(ids)];

        // makes a metaObjects which has all the children collections
        metaobjectsCreator(
          session,
          i.Grandparent,
          i.Parent,
          uniqueIDS,
          parentID
        );
      });
    }, 3000);

    res.status(status).json("cool beans");
  } catch (e) {
    console.log(`Failed to process: ${e.message}`);
    status = 500;
    error = e.message;

    res.status(status).send(error);
  }
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
