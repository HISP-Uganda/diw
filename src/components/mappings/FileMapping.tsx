import {
  Box, FormControl, FormHelperText, FormLabel, NumberDecrementStepper, NumberIncrementStepper, NumberInput,
  NumberInputField,
  NumberInputStepper, SimpleGrid, Stack, VStack
} from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { isEmpty } from 'lodash';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import Worker from 'worker-loader!../workers/FileLoader';
import { WorkBook } from 'xlsx';
import { changeMappingAttribute, changeMessage, changeSheetAttribute, onClose, onOpen, setMetaData, setSheetNames } from '../models/Events';
import { app, labels } from '../models/Store';
import { OuColumnMapping } from './OuColumnMapping';
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
    if (!isEmpty(store.mapping.sheet)) {
      changeSheetAttribute({ key: 'selectedSheet', value: store.mapping.sheet.selectedSheet });
      changeSheetAttribute({ key: 'headerRow', value: store.mapping.sheet.headerRow })
      changeSheetAttribute({ key: 'dataStartRow', value: store.mapping.sheet.dataStartRow })
      changeMappingAttribute({ key: 'orgUnitColumn', value: store.mapping.orgUnitColumn })
      changeMappingAttribute({ key: 'otherOrgUnitColumns', value: store.mapping.otherOrgUnitColumns })
    }
    onClose()
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      changeMessage('Uploading selected file')
      onOpen()
      const [file] = acceptedFiles;
      setFileName(file.name)
      worker.postMessage(acceptedFiles);
    }
  }, []);

  const changeSelectedSheet = (value: any) => {
    changeSheetAttribute({ key: 'selectedSheet', value });
    if (store.mapping.sheet.dataStartRow) {
      changeSheetAttribute({ key: 'headerRow', value: store.mapping.sheet.headerRow })
      changeSheetAttribute({ key: 'dataStartRow', value: store.mapping.sheet.dataStartRow })
      changeMappingAttribute({ key: 'orgUnitColumn', value: store.mapping.orgUnitColumn })
      changeMappingAttribute({ key: 'otherOrgUnitColumns', value: store.mapping.otherOrgUnitColumns })
    } else {
      changeSheetAttribute({ key: 'headerRow', value: 1 })
      changeSheetAttribute({ key: 'dataStartRow', value: 2 })
    }
  }

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
      {store.sheetNames.length > 0 && <>
        <Select placeholder="Selected Sheet" options={store.sheetNames} value={store.mapping.sheet.selectedSheet} onChange={changeSelectedSheet} />
        <SimpleGrid minChildWidth="100px" spacing={5} flex={1}>
          <FormControl isRequired>
            <FormLabel>{$labels}</FormLabel>
            <NumberInput placeholder={$labels} value={store.mapping.sheet.headerRow} min={1} onChange={(v1: string, v2: number) => changeSheetAttribute({ key: 'headerRow', value: v2 })}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Data Start Row</FormLabel>
            <NumberInput placeholder="Header Row" value={store.mapping.sheet.dataStartRow} min={store.mapping.sheet.headerRow + 1} onChange={(v1: string, v2: number) => changeSheetAttribute({ key: 'dataStartRow', value: v2 })}>
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <OuColumnMapping />
        </SimpleGrid>
      </>}
    </Stack>
  )
}