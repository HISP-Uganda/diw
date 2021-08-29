import { Flex } from '@chakra-ui/react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { useD2 } from '../Context';
import { useLoader } from './Queries';
import Home from './Home';
import { Loading } from './Loading';

const App = () => {
  const d2 = useD2()
  const { isLoading, isError, isSuccess, error } = useLoader(d2)
  return (
    <>
      {isLoading && <Loading />}
      {isSuccess && <Router>
        <Flex direction="column">
          <Switch>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Flex>
      </Router>}
      {isError && <Flex>{error.message}</Flex>}
    </>
  )
}

export default App
