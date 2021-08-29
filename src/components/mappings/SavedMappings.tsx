import {
  Table, Tbody, Td, Th, Thead, Tr,
  Flex
} from '@chakra-ui/react';
import { useState } from 'react';
import { FC } from "react";
import { useD2 } from "../../Context";
import { Loading } from "../Loading";
import { changeMessage, createMapping, onOpen, setPreviousMapping } from '../models/Events';
import { Mapping, Value } from '../models/interfaces';
import { useNamespaces, useSavedMapping } from "../Queries";

export const SavedMappings: FC<{ mappings: string[] }> = ({ mappings }) => {
  const [mapping, setMapping] = useState<string>("")
  const [mappingType, setMappingType] = useState<Value>({ label: "", value: "" });
  const d2 = useD2();
  const savedMappings = useNamespaces(d2, 'diw-mappings', mappings);
  const {
    isError,
    error
  } = useSavedMapping(d2, mapping, mappingType);

  const useSaved = async (mappingId: string, savedMapping: Mapping) => {
    changeMessage('Fetching previous data mapping')
    onOpen();
    createMapping({
      id: mappingId,
      ...savedMapping
    });
    setMapping(mappingId)
    setMappingType(savedMapping.type);
    changeMessage('');
  }
  return (
    <>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
          </Tr>
        </Thead>
        <Tbody>
          {savedMappings.map(({ isLoading, isError, isSuccess, data, error }: any, index: number) =>
            <Tr key={mappings[index]}>
              {
                isSuccess && <>
                  <Td cursor="pointer" onClick={() => useSaved(mappings[index], data)}>{mappings[index]}</Td>
                  <Td cursor="pointer" onClick={() => useSaved(mappings[index], data)}>{data.name}</Td>
                </>
              }
              {isLoading && <Td colSpan={2}> <Loading /></Td>}
              {isError && <Td colSpan={2}> {error.message}</Td>}
            </Tr>
          )}
        </Tbody>
      </Table>
      {isError && <Flex>{error.message}</Flex>}
    </>
  )
}