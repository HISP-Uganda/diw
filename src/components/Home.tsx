import { Box, Button, Flex, SimpleGrid, Spacer } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { useD2 } from '../Context';
import { home, next, previous } from '../Events';
import { useDataStore } from '../Queries';
import { app, nextIsDisabled, nextLabel } from '../Store';
import { Loading } from './Loading';
import { EventsMapping, OrganisationMapping, OrganisationsByLevel, RemoteResources, ResourcePicker, ResourceType, TrackedEntityMapping } from './mappings';
import { AggregateMapping } from './mappings/AggregateMapping';

const Home = () => {
  const d2 = useD2();
  const { isLoading, isError, isSuccess, error, data } = useDataStore(d2, 'agg1');
  const store = useStore(app);
  const $nextLabel = useStore(nextLabel)
  const $nextIsDisabled = useStore(nextIsDisabled);
  const display = () => {

    const steps = {
      0: <Flex direction="column">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Flex>,
      1: <ResourceType />,
      2: <ResourcePicker />,
      3: <RemoteResources />,
      4: <OrganisationMapping />,
      5: <OrganisationsByLevel />,
      6: <TrackedEntityMapping />,
      7: <EventsMapping />,
      8: <AggregateMapping />,
    }
    return steps[store.step] || <Box>Invalid step</Box>
  }
  return (
    <Flex direction="column">
      {isLoading && <Loading />}
      {isSuccess && <Flex direction="column" h="calc(100vh - 48px)" px="5">
        {display()}
        <Spacer />
        <SimpleGrid columns={3} py="5">
          <Box>{store.step > 1 && <Button onClick={() => previous()}>Previous</Button>}</Box>
          <Box textAlign="center" color="blue.400">{store.step !== 0 && <Button onClick={() => home()}>Cancel</Button>}</Box>
          <Box textAlign="right"><Button onClick={() => next()} isDisabled={$nextIsDisabled}>{$nextLabel}</Button></Box>
        </SimpleGrid>
      </Flex>}
      {isError && <Flex>{error.message}</Flex>}
    </Flex>
  )
}

export default Home
