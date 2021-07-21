import {
  Flex, Table, Tbody, Td, Th, Thead, Tr
} from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { useD2 } from "../../Context";
import { changeMappingAttribute, next } from "../../Events";
import { useResources } from "../../Queries";
import { app } from "../../Store";
import { Loading } from "../Loading";

export const ResourcePicker = () => {
  const d2 = useD2()
  const store = useStore(app);
  const { isLoading, isError, isSuccess, error, data } = useResources(d2, store.mapping.type);
  const updateMapping = (id: string, name: string) => {
    changeMappingAttribute({ key: 'resource', value: id });
    changeMappingAttribute({ key: 'resourceName', value: name });
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