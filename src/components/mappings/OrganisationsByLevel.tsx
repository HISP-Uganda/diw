import { Flex } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { useRemoteOrganisations } from "../../Queries";
import { app, getRemoteAPI } from "../../Store";
import { Loading } from "../Loading";
import { OUMapping } from "./OUMapping";

export const OrganisationsByLevel = () => {
  const store = useStore(app);
  const api = useStore(getRemoteAPI);
  const { isLoading, isError, isSuccess, error, data } = useRemoteOrganisations(api, store.mapping.level);
  return (
    <>
      {isLoading && <Loading />}
      {isSuccess && <OUMapping units={data}/>}
      {isError && <Flex>{error.message}</Flex>}
    </>
  )
}