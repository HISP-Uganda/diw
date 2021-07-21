import { Flex, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { useRemoteResources } from '../../Queries';
import { changeMappingAttribute, next } from "../../Events";
import { app, getRemoteAPI } from "../../Store";
import { Loading } from "../Loading";

export const RemoteResources = () => {
  const store = useStore(app);
  const api = useStore(getRemoteAPI)
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
        <Table variant="simple">
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
        </Table>
      </Flex>}
      {isError && <Flex>{error.message}</Flex>}
    </>
  )
}
