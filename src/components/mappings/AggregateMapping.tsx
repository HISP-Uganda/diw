import { Stack, Box } from '@chakra-ui/react';
import Select from 'react-select'

import { useStore } from 'effector-react'
import { coc, app, remoteCOC } from "../../Store"
import { FC } from 'react';

interface Element {
  d: any,
}

const DataElementMapping: FC<Element> = ({ d }) => {
  const store = useStore(app);
  const coc$ = useStore(remoteCOC);
  return <Stack direction="row" alignItems="center" spacing="50px">
    <Box flex={1}>{d.name}</Box>
    <Box flex={1}>
      <Select
        isClearable
        placeholder="Select column"
        getOptionLabel={(a: any) => a.displayName}
        getOptionValue={(b: any) => b.id}
        options={coc$}
      />
    </Box>
  </Stack>
}

export const AggregateMapping = () => {
  const $coc = useStore(coc)
  return (
    <Stack>
      <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
        <Box flex={1}>Name</Box>
        <Box flex={1}>Mapping</Box>
      </Stack>
      <Stack direction="column" overflow="auto" h="800px">
        {$coc.map((d: any) => <DataElementMapping key={d.id} d={d} />)}
      </Stack>
    </Stack>
  )
}
