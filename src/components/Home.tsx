import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Spacer,
  Spinner,
  Stack,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { useMutation, useQueryClient } from 'react-query';
import { useD2 } from '../Context';
import { Loading } from './Loading';
import { AttributionMapping, EventsMapping, OrganisationMapping, RemoteResources, ResourcePicker, ResourceType, TrackedEntityMapping } from './mappings';
import { AggregateMapping } from './mappings/AggregateMapping';
import DataPreview from './mappings/DataPreview';
import { ImportData } from './mappings/ImportData';
import { SavedMappings } from './mappings/SavedMappings';
import { Schedule } from './mappings/Schedule';
import { home, next, onClose, previous } from './models/Events';
import {
  $attributeMapping,
  $attributionMapping,
  $categoryOptionComboMapping,
  $message,
  $nextIsDisabled,
  $organisationUnitMapping,
  $stageMapping,
  app,
  nextLabel
} from './models/Store';
import { saveMapping, useDataStore } from './Queries';

const Home = () => {
  const d2 = useD2();
  const toast = useToast();
  const queryClient = useQueryClient()
  const { isLoading, isError, isSuccess, error, data } = useDataStore(d2, 'diw-mappings');

  const store = useStore(app);
  const message = useStore($message);
  const $nextLabel = useStore(nextLabel);
  const nextIsDisabled = useStore($nextIsDisabled);

  const organisationUnitMapping = useStore($organisationUnitMapping);
  const attributeMapping = useStore($attributeMapping);
  const stageMapping = useStore($stageMapping);
  const categoryOptionComboMapping = useStore($categoryOptionComboMapping);
  const attributionMapping = useStore($attributionMapping);

  const { mutateAsync } = useMutation(() => saveMapping(
    d2,
    store.mapping,
    organisationUnitMapping,
    attributeMapping,
    stageMapping,
    attributionMapping,
    categoryOptionComboMapping,
    store.savedMappings.indexOf(store.mapping.id) === -1),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["dataStore", 'diw-mappings'])
      },
    })
  const saveCurrentMapping = async () => {
    await mutateAsync();
    toast({
      title: "Mapping",
      description: "Mapping successfully saved",
      status: "success",
      position: 'top-right',
      duration: 1000,
      isClosable: true,
    })
  }
  const display = () => {
    const steps = {
      0: <SavedMappings mappings={data} />,
      1: <ResourceType />,
      2: <ResourcePicker />,
      3: <RemoteResources />,
      4: <OrganisationMapping />,
      5: <TrackedEntityMapping />,
      6: <EventsMapping />,
      7: <AggregateMapping />,
      8: <AttributionMapping />,
      9: <DataPreview />,
      10: <ImportData />,
      11:'',
      12: <Schedule />
    }
    return steps[store.step] || <Box>Invalid step</Box>
  }
  return (
    <Flex direction="column">
      <Text>{store.step}</Text>
      {isLoading && <Loading />}
      {isSuccess && <Flex direction="column" h="calc(100vh - 48px)" px="5">
        {display()}
        <Spacer />
        <SimpleGrid columns={3} py="5">
          <Box>{store.step > 1 && <Button onClick={() => previous()}>Previous</Button>}</Box>
          <Flex textAlign="center" justifyContent="center">
            {store.step !== 0 && <Stack direction="row" spacing="20px">
              <Button onClick={() => home()}>Cancel</Button>
              <Button onClick={() => saveCurrentMapping()}>Save</Button>
            </Stack>}
          </Flex>
          <Box textAlign="right"><Button onClick={() => next()} isDisabled={nextIsDisabled}>{$nextLabel}</Button></Box>
        </SimpleGrid>
      </Flex>}
      {isError && <Flex>{error.message}</Flex>}
      <Modal isOpen={store.isOpen} onClose={onClose} isCentered closeOnOverlayClick={false} motionPreset="scale">
        <ModalOverlay />
        <ModalContent bg="none" boxShadow="none">
          <ModalBody>
            <VStack>
              <Spinner color="white" size="lg" />
              <Text color="white">
                {message}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default Home
