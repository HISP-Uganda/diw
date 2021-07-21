
import { Accordion, Stack, Text } from "@chakra-ui/react";
import { useStore } from 'effector-react';
import { app, stages } from "../../Store";
import { ProgramStageMapping } from "./ProgramStageMapping";

export const EventsMapping = () => {
  const $stages = useStore(stages);
  const store = useStore(app);
  return (
    <Stack spacing="20px">
      <Text>Program Stage Mappings for {store.currentResource.name}</Text>
      <Accordion allowToggle colorScheme="purple">
        {$stages.map((s: any) => <ProgramStageMapping key={s.id} stage={s} />)}
      </Accordion>
    </Stack>
  )
}
