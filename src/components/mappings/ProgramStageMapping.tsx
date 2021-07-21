import { AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Checkbox, FormControl, FormLabel, Stack } from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { FC } from "react";
import Select from 'react-select'

import { OptionsProps, ProgramStageMappingProps } from "../../interfaces";
import { app, excelSheets } from '../../Store';
import { addStageAttribute, addStageCheckboxAttribute, addStageDataElement, addStageMapping } from '../../utils';
interface Element {
  d: any,
  stage: string
}

const ColumnSelect: FC<OptionsProps> = ({ stage, attribute }) => {
  const store = useStore(app);
  return <Select
    placeholder="Select Event Date Column"
    value={store.mapping.stageMapping[stage]?.[attribute]}
    onChange={addStageAttribute(stage, attribute)}
    isClearable
    options={store.columns}
  />
}

const DataElementMapping: FC<Element> = ({ d, stage }) => {
  const store = useStore(app);
  return <Stack direction="row" alignItems="center" spacing="50px">
    <Box flex={1}>{d.name}</Box>
    <Box w="100px" textAlign="center"><Checkbox isDisabled isChecked={d.compulsory} /></Box>
    <Box flex={1}>
      <Select
        isClearable
        placeholder="Select column"
        value={store.mapping.stageMapping[stage]?.mapping[d.id]?.equivalent}
        onChange={addStageDataElement(stage, d.id)}
        options={store.columns}
      />
    </Box>
    <Box w="100px" textAlign="center">{d.optionSetValue && <Button>Map Options</Button>}</Box>
    <Box w="100px" textAlign="center"><Checkbox isChecked={store.mapping.stageMapping[stage]?.mapping[d.id]?.isIdentifier} /></Box>
  </Stack>
}

export const ProgramStageMapping: FC<ProgramStageMappingProps> = ({ stage }) => {
  const store = useStore(app);
  const sheets = useStore(excelSheets)

  return (
    <AccordionItem>
      {({ isExpanded }) => (
        <>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {stage.name}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel py={4}>
            {isExpanded && <Stack spacing="20px">
              <Stack spacing={10} direction="row">
                <Checkbox
                  isChecked={store.mapping.stageMapping[stage.id]?.createEvents}
                  onChange={addStageMapping(stage.id, !!store.mapping.stageMapping[stage.id]?.updateEvents, 'update')}
                >
                  Create Events
                </Checkbox>
                <Checkbox
                  isChecked={store.mapping.stageMapping[stage.id]?.updateEvents}
                  onChange={addStageMapping(stage.id, !!store.mapping.stageMapping[stage.id]?.createEvents, 'create')}
                >
                  Update Events
                </Checkbox>
                {(store.mapping.stageMapping[stage.id]?.createEvents || store.mapping.stageMapping[stage.id]?.updateEvents) && <>
                  <Checkbox
                    isChecked={store.mapping.stageMapping[stage.id]?.dateIdentifiesEvent}
                    onChange={addStageCheckboxAttribute(stage.id, 'completeEvents')}
                  >
                    Event Date Uniquely Identifies Event
                  </Checkbox>
                  <Checkbox
                    isChecked={store.mapping.stageMapping[stage.id]?.completeEvents}
                    onChange={addStageCheckboxAttribute(stage.id, 'completeEvents')}
                  >
                    Mark Events as Complete
                  </Checkbox>
                  <Checkbox
                    isChecked={store.mapping.stageMapping[stage.id]?.eventUIDProvided}
                    onChange={addStageCheckboxAttribute(stage.id, 'eventUIDProvided')}
                  >
                    Event UID Column Provided
                  </Checkbox>
                </>}
              </Stack>

              {(store.mapping.stageMapping[stage.id]?.createEvents || store.mapping.stageMapping[stage.id]?.updateEvents) && <Stack spacing={5} direction="row">
                <FormControl id="type" isRequired>
                  <FormLabel>Select Sheet with Data</FormLabel>
                  <Select
                    isClearable
                    placeholder="Select Sheet with Data"
                    value={store.mapping.stageMapping[stage.id].sheet}
                    onChange={addStageAttribute(stage.id, 'sheet')} options={sheets}
                  />
                </FormControl>
                {!!store.mapping.stageMapping[stage.id]?.sheet && <FormControl id="type" isRequired>
                  <FormLabel>Event Date Column</FormLabel>
                  <ColumnSelect stage={stage.id} attribute="eventDateColumn" />
                </FormControl>}

                {store.mapping.stageMapping[stage.id]?.eventUIDProvided && <FormControl id="type" isRequired>
                  <FormLabel>Event UID Column</FormLabel>
                  <ColumnSelect stage={stage.id} attribute="eventUIDColumn" />
                </FormControl>}

                {!!store.mapping.stageMapping[stage.id]?.eventDateColumn && <>
                  <FormControl id="type">
                    <FormLabel>Latitude Column</FormLabel>
                    <ColumnSelect stage={stage.id} attribute="latitudeColumn" />
                  </FormControl>
                  <FormControl id="type">
                    <FormLabel>Longitude Column</FormLabel>
                    <ColumnSelect stage={stage.id} attribute="longitudeColumn" />
                  </FormControl>
                </>}
              </Stack>}

              {!!store.mapping.stageMapping[stage.id]?.eventDateColumn && <>
                <Stack direction="row" alignItems="center" spacing="50px" mb="10px">
                  <Box flex={1}>Name</Box>
                  <Box w="100px" textAlign="center">Required</Box>
                  <Box flex={1}>Mapping</Box>
                  <Box w="100px" textAlign="center">Option Mapping</Box>
                  <Box w="100px" textAlign="center">Identifies Event</Box>
                </Stack>
                <Stack direction="column" overflow="auto" h="400px">
                  {stage.elements.map((d: any, i: number) => <DataElementMapping key={d.id} d={d} stage={stage.id} />)}
                </Stack>
              </>}
            </Stack>}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  )
}