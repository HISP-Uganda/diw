
import { Accordion, Stack, Text } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { app } from "../models/Store";
import { ProgramStageMapping } from "./ProgramStageMapping";

export const EventsMapping = () => {
  const store = useStore(app);
  return (
    <Stack spacing="20px">
      <Text>Program Stage Mappings</Text>
      <Accordion allowToggle colorScheme="purple">
        {store.destinationStages.map((s: any) => <ProgramStageMapping key={s.id} stage={s} />)}
      </Accordion>
    </Stack>
  )
}
