import { Flex } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { Loading } from "../Loading";
import { app, getRemoteAPI } from "../models/Store";
import { useRemoteOrganisations } from "../Queries";
import { OUMapping } from "./OUMapping";

export const OrganisationsByLevel = () => {
  const store = useStore(app);
  const api = useStore(getRemoteAPI);
  // const { isLoading, isError, isSuccess, error, data } = useRemoteOrganisations(api, store.mapping.remoteLogins.aggregationLevel?.value);
  return (
    <>

    </>
  )
}