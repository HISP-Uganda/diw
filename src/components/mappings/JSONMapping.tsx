import {
  Box, FormControl,
  FormLabel, Stack, Text, VStack
} from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Select from 'react-select';
import { addSheet, changeSheetAttribute, setData, setSheetNames } from '../../Events';
import { app } from '../../Store';

export const JSONMapping = () => {
  const store = useStore(app);
  const [fileName, setFileName] = useState<string>('');

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const [file] = acceptedFiles;
      setFileName(file.name);
      const reader = new FileReader()
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        setSheetNames([])
        const data = JSON.parse(String(reader.result));
        setSheetNames(['JSON']);
        setData(data);
        addSheet('JSON');
        console.log('Wired')
      }
      reader.readAsBinaryString(file)
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1, accept: ".json" });
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
      {Object.entries(store.mapping.sheets).map(([sheetName, sheet]) => <Stack key={sheetName} spacing="6" direction="row" w="100%" alignItems="center">
        <Text w="15%">{sheetName}</Text>
        <FormControl isRequired>
          <FormLabel>Organisation Column</FormLabel>
          <Select placeholder="Organisation Unit Column" options={sheet.columns} value={sheet.orgUnitColumn} onChange={(e: any) => changeSheetAttribute({ sheet: sheetName, attribute: 'orgUnitColumn', value: e })} />
        </FormControl>
      </Stack>)}

    </Stack>
  )
}
