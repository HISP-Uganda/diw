import { Flex, FormControl, FormLabel, Select } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { useD2 } from '../../Context';
import { useResource } from "../../Queries";
import { app, getRemoteAPI, showLabel } from "../../Store";
import { onChange } from "../../utils";
import { Loading } from "../Loading";
import { DefaultOrganisationUnits } from './MappingUtils';

export const OrganisationMapping = () => {
  const store = useStore(app);
  const d2 = useD2()
  const api = useStore(getRemoteAPI)
  const { isLoading, isError, isSuccess, error } = useResource(d2, store.mapping.type, store.mapping.resource, api, store.mapping.remoteResource);
  const showLevel$ = useStore(showLabel);
  return (
    <>
      {isLoading && <Loading />}
      {isSuccess && <>
        {
          showLevel$ ? <>
            <FormControl isRequired>
              <FormLabel>Level</FormLabel>
              <Select placeholder="Select column" onChange={onChange('level')} value={store.mapping.level}>
                {store.levels.map(({ id, level, name }: any) => <option key={id} value={level}>{name}</option>)}
              </Select>
            </FormControl>
          </> : <DefaultOrganisationUnits />
        }

      </>}
      {isError && <Flex>{error.message}</Flex>}
    </>

  )
}