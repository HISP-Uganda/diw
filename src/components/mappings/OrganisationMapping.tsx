import { Flex } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { useD2 } from '../../Context';
import { Loading } from "../Loading";
import { app, getRemoteAPI } from "../models/Store";
import { useResource } from "../Queries";
import { DefaultOrganisationUnits } from './MappingUtils';

export const OrganisationMapping = () => {
  const store = useStore(app);
  const d2 = useD2()
  const api = useStore(getRemoteAPI)
  const { isLoading, isError, isSuccess, error } = useResource(
    d2,
    store.mapping.type,
    store.mapping.resource,
    api,
    store.localOrgUnitLevels,
    store.remoteOrgUnitLevels,
    store.mapping.remoteResource,
    store.mapping.remoteLogins.aggregationLevel?.level
  );
  return (
    <>
      {isLoading && <Loading />}
      {isSuccess && <DefaultOrganisationUnits />}
      {isError && <Flex>{error.message}</Flex>}
    </>

  )
}