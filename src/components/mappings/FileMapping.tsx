import {
  Box, FormControl, FormHelperText, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput,
  NumberInputField,
  NumberInputStepper, SimpleGrid, Stack, VStack
} from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import Worker from 'worker-loader!../workers/FileLoader';
import { WorkBook } from 'xlsx';
import { changeMappingAttribute, changeSheetAttribute, setMetaData, setSheetNames } from '../../Events';
import { app, labels } from '../../Store';
const worker = new Worker();

export function FileMapping() {
  const store = useStore(app);
  const $labels = useStore(labels);
  const [fileName, setFileName] = useState<string>('');
  worker.onmessage = function (event) {
    setSheetNames([])
    const book: WorkBook = event.data;
    setSheetNames(book.SheetNames.map((sheet: string) => {
      return {
        label: sheet,
        value: sheet
      }
    }));
    setMetaData(book);
  };
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const [file] = acceptedFiles;
      setFileName(file.name)
      worker.postMessage(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, accept: ".csv, .xls, .xlsx" });
  return (
    <Stack spacing="6">
      <VStack spacing="5">
        <Box>{fileName}</Box>
        <Box {...getRootProps()} h="100px">
          <input {...getInputProps()} />
          {
            isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>
          }
        </Box>
      </VStack>
      <Select placeholder="Selected Sheet" options={store.sheetNames} value={store.sheet.selectedSheet} onChange={(e: any) => changeSheetAttribute({ key: 'selectedSheet', value: e })} />
      <SimpleGrid minChildWidth="100px" spacing={5} flex={1}>
        <FormControl isRequired>
          <FormLabel>{$labels}</FormLabel>
          <NumberInput placeholder={$labels} value={store.mapping.headerRow} min={1} onChange={(v1: string, v2: number) => changeSheetAttribute({ key: 'headerRow', value: v2 })}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Data Start Row</FormLabel>
          <NumberInput placeholder="Header Row" value={store.sheet.dataStartRow} min={store.sheet.headerRow + 1} onChange={(v1: string, v2: number) => changeSheetAttribute({ key: 'dataStartRow', value: v2 })}>
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Organisation Column</FormLabel>
          <Select placeholder="Organisation Unit Column" options={store.currentResource} value={store.mapping.orgUnitColumn} onChange={(e: any) => changeMappingAttribute({ key: 'orgUnitColumn', value: e })} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Other Organisation Column</FormLabel>
          <Select placeholder="Organisation Unit Column" isMulti options={store.currentResource} value={store.mapping.otherOrgUnitColumns} onChange={(e: any) => changeMappingAttribute({ key: 'otherOrgUnitColumns', value: e })} />
          <FormHelperText>In descending order beginning with highest level</FormHelperText>
        </FormControl>
      </SimpleGrid>
    </Stack>
  )
}