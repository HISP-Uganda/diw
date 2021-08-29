import { Box, Stack, Text } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import Select from 'react-select';
import { addAttribution } from "../../utils";
import { $attributionMapping, $organisationUnitMapping, $sourceAttributions, app } from "../models/Store";

export const AttributionMapping = () => {
  const store = useStore(app);
  const sourceAttributions = useStore($sourceAttributions);
  const organisationUnitMapping = useStore($organisationUnitMapping);
  const attributionMapping = useStore($attributionMapping)
  return (
    <Stack spacing="20px">
      <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
        <Stack flex={1}>
          <Text>Source Attribution</Text>
        </Stack>
        <Stack flex={1}>
          <Text>Destination Attribution</Text>
        </Stack>
      </Stack>
      <Stack direction="column" overflow="auto" h="calc(100vh - 205px)">
        {sourceAttributions.slice(0, 10).map((name) => <Stack key={name} direction="row" alignItems="center" spacing="50px">
          <Box flex={1}>{name}</Box>
          <Box flex={1}>
            <Select placeholder="Select Column" options={store.destinationAttributions} value={attributionMapping[name]?.equivalent}
              onChange={addAttribution(name)} />
          </Box>
        </Stack>)}
      </Stack>
    </Stack>
  )
}