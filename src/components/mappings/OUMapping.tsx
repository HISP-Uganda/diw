import { Box, Stack, Text } from "@chakra-ui/react";
import { useEffect } from 'react'
import { useStore } from 'effector-react';
import { FC } from "react";
import Select from 'react-select';
import { changeStoreAttribute } from "../../Events";
import { $localUnits, $remoteUnits, app } from "../../Store";
import { OUSelect } from './MappingUtils';
import { autoMapOrganisations } from "../../utils";

interface OUMappingProps {
}

export const OUMapping: FC<OUMappingProps> = () => {
  const store = useStore(app)
  const remoteUnits = useStore($remoteUnits)
  const localUnits = useStore($localUnits)

  useEffect(() => {
    autoMapOrganisations(remoteUnits, localUnits)
  }, [store.destParents, store.sourceParents]);

  return <Stack spacing="20px">
    <Text>{remoteUnits.length}</Text>
    <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
      <Stack flex={1}>
        <Text>Source Organisation</Text>
        <Select
          value={store.sourceParents}
          isMulti
          onChange={(val: any) => changeStoreAttribute({ key: 'sourceParents', value: val })}
          options={Object.keys(remoteUnits[0].parent).map((c: any) => {
            return {
              label: c,
              value: c
            }
          })}
          isClearable
        />
      </Stack>
      <Stack flex={1}>
        <Text>Destination Mapping</Text>
        <Select
          value={store.destParents}
          isMulti
          onChange={(val: any) => changeStoreAttribute({ key: 'destParents', value: val })}
          options={Object.keys(store.destinationOrganisationUnits[0].parent).map((c: any) => {
            return {
              label: c,
              value: c
            }
          })}
          isClearable
        />
      </Stack>
    </Stack>
    <Stack direction="column" overflow="auto" h="calc(100vh - 205px)">
      {remoteUnits.map(({ id, name }: any, i: number) => <Stack key={id} direction="row" alignItems="center" spacing="50px">
        <Box flex={1}>{name}</Box>
        <Box flex={1}>
          <OUSelect unit={id} />
        </Box>
      </Stack>)}
    </Stack>
  </Stack>
}