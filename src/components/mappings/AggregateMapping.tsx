import { Box, Stack } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { FC } from 'react';
import Select from 'react-select';
import { app } from "../models/Store";

interface Element {
  d: any,
}

const DataElementMapping: FC<Element> = ({ d }) => {
  const store = useStore(app);
  return <Stack direction="row" alignItems="center" spacing="50px">
    <Box flex={1}>{d.name}</Box>
    <Box flex={1}>
      <Select
        isClearable
        placeholder="Select column"
        getOptionLabel={(a: any) => a.name}
        getOptionValue={(b: any) => b.id}
        options={store.sourceCategoryCombos}
      />
    </Box>
  </Stack>
}

export const AggregateMapping = () => {
  const store = useStore(app);
  return (
    <Stack>
      <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
        <Box flex={1}>Name</Box>
        <Box flex={1}>Mapping</Box>
      </Stack>
      <Stack direction="column" overflow="auto" h="800px">
        {store.destinationCategoryCombos.map((d: any) => <DataElementMapping key={d.id} d={d} />)}
      </Stack>
    </Stack>
  )
}
