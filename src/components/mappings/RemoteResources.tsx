import {
  Flex, FormControl,
  FormLabel, Stack, Table, Tbody, Td, Th, Thead, Tr
} from "@chakra-ui/react";
import { useStore } from 'effector-react';
import Select from 'react-select';
import { Loading } from "../Loading";
import { changeMappingAttribute, changeRemoteLogin, next } from "../models/Events";
import { $requiresLevel, app, getRemoteAPI } from "../models/Store";
import { useRemoteResources } from '../Queries';

export const RemoteResources = () => {
  const store = useStore(app);
  const requiresLevel = useStore($requiresLevel);

  const api = useStore(getRemoteAPI);
  const { isLoading, isError, isSuccess, error, data } = useRemoteResources(api, store.mapping.type);
  const updateMapping = (id: string, name: string) => {
    changeMappingAttribute({ key: 'remoteResource', value: id });
    changeMappingAttribute({ key: 'remoteResourceName', value: name });
    next()
  }
  return (
    <>
      {isLoading && <Loading />}
      {isSuccess && <Flex direction="column" h="100%" overflow="auto">
        {requiresLevel ? <Stack>
          <FormControl isRequired>
            <FormLabel>AggregationLevel</FormLabel>
            <Select
              placeholder="Select column"
              value={store.mapping.remoteLogins.aggregationLevel}
              options={store.remoteOrgUnitLevels}
              onChange={(value) => changeRemoteLogin({ attribute: 'aggregationLevel', value })}
              getOptionLabel={(a: any) => a.name}
              getOptionValue={(b: any) => b.level}
            />
          </FormControl>
        </Stack> : <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((d: any) => <Tr cursor="pointer" key={d.id} onClick={() => updateMapping(d.id, d.name)}>
              <Td>{d.id}</Td>
              <Td>{d.name}</Td>
            </Tr>)}
          </Tbody>
        </Table>}
      </Flex>}
      {isError && <Flex>{error.message}</Flex>}
    </>
  )
}
