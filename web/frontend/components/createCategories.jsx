import { useEffect, useState } from "react";
import {
  Card,
  Button
} from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";

export function CreateCategories() {
  // figure out mount issue
  const {
    data,
    isLoading: isLoadingTrue,
    refetch,
    isRefetching: isRefetchingTrue,
  } = useAppQuery({
    url: "/api/create",
    reactQueryOptions: {
      enabled: false
    },
  });

  
  const HandleSync = () => {
    refetch();
  };
  

  return (
    <Card>
    <div
      style={{
        padding: "10px 20px 10px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {isLoadingTrue || isRefetchingTrue ? (
        <>
          <Text>Loading</Text>
        </>
      ) : (
        <>
          <Button primary onClick={HandleSync}>
            Create the things
          </Button>
        </>
      )}
    </div>
  </Card>
  );
}
