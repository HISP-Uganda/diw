import { Box, Stack, Text } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { FC, useEffect } from 'react';
import Select from 'react-select';
import { autoMapOrganisations } from "../../utils";
import { changeMappingAttribute } from "../models/Events";
import { $destinationOrganisationUnits, $sourceOrganisationUnits, app } from "../models/Store";
import { OUSelect } from './MappingUtils';

interface OUMappingProps {
}

export const OUMapping: FC<OUMappingProps> = () => {
  const store = useStore(app)
  const sourceOrganisationUnits = useStore($sourceOrganisationUnits)
  const destinationOrganisationUnits = useStore($destinationOrganisationUnits)

  useEffect(() => {
    autoMapOrganisations(sourceOrganisationUnits, destinationOrganisationUnits)
  }, [store.mapping.destParents, store.mapping.sourceParents]);

  return <Stack spacing="20px">
    {/* <Text>{sourceOrganisationUnits.length}</Text> */}
    <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
      <Stack flex={1}>
        <Text>Source Organisation</Text>
        <Select
          value={store.mapping.sourceParents}
          isMulti
          onChange={(val: any) => changeMappingAttribute({ key: 'sourceParents', value: val })}
          options={Object.keys(sourceOrganisationUnits?.[0].parent).map((c: any) => {
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
          value={store.mapping.destParents}
          isMulti
          onChange={(val: any) => changeMappingAttribute({ key: 'destParents', value: val })}
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
    <Stack direction="column" overflow="auto" h="calc(100vh - 235px)">
      {sourceOrganisationUnits.map(({ id, name }: any, i: number) => <Stack key={id} direction="row" alignItems="center" spacing="50px">
        <Box flex={1}>{name}</Box>
        <Box flex={1}>
          <OUSelect unit={id} />
        </Box>
      </Stack>)}
    </Stack>
  </Stack>
}