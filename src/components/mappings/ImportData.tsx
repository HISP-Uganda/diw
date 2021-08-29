import { useStore } from 'effector-react';
import { useMutation } from 'react-query'
import { useEffect } from 'react';
import { useD2 } from '../../Context';
import { onClose, onOpen } from '../models/Events';
import { app } from '../models/Store'
import { postData } from '../Queries';
export const ImportData = () => {
  const d2 = useD2();
  const store = useStore(app);

  const {mutateAsync } = useMutation(() => postData(d2, store.processedData))

  const insertData = async () => {
    if (store.processedData) {
      onOpen();
      await mutateAsync();
      onClose();
    }
  }

  useEffect(() => {
    insertData()
  }, [])
  return (
    <div>
      Importing
    </div>
  )
}
