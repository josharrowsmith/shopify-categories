import {
  Card,
  Page,
  Layout
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { CreateCategories } from "../components";

export default function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title="App name" primaryAction={null} />
      <Layout>
        <Layout.Section>
            <CreateCategories/>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
