import {
  Box, Stack, VStack, SimpleGrid
} from '@chakra-ui/react';
import { useStore } from 'effector-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { setSourceResource, setData } from '../models/Events';
import { app } from '../models/Store';
import { OuColumnMapping } from './OuColumnMapping';

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
        const data = JSON.parse(String(reader.result));
        const processed = Object.keys(data[0]).map((value: string) => {
          return {
            label: value,
            value
          }
        });
        setSourceResource(processed);
        setData(data);
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
      <SimpleGrid minChildWidth="100px" spacing={5} flex={1}>
        <OuColumnMapping />
      </SimpleGrid>
    </Stack>
  )
}
