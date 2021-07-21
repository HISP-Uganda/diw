import {
  FormControl,
  FormLabel, Input,
  ListItem,
  UnorderedList
} from '@chakra-ui/react';
import { ChangeEvent, FC, KeyboardEvent, MouseEvent, useState } from 'react';


interface AutoCompleteProps {
  suggestions: any[]
}

const AutoComplete: FC<AutoCompleteProps> = ({ suggestions }) => {
  const [activeSuggestion, setActiveSuggestion] = useState<number>(0);
  const [filteredSuggestions, setFilteredSuggestion] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const userInput = e.currentTarget.value;
    const filteredSuggestions = suggestions.filter(suggestion => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1);
    setActiveSuggestion(0);
    setFilteredSuggestion(filteredSuggestions);
    setShowSuggestions(true);
    setUserInput(e.currentTarget.value);
  };

  const onClick = (e: MouseEvent<HTMLLIElement>) => {
    setActiveSuggestion(0);
    setFilteredSuggestion([]);
    setShowSuggestions(false);
    setUserInput(e.currentTarget.id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // User pressed the enter key
    if (e.key === "Enter") {
      setActiveSuggestion(0);
      setShowSuggestions(false);
      setUserInput(filteredSuggestions[activeSuggestion]);
    }
    // User pressed the up arrow
    else if (e.key === "ArrowUp") {
      if (activeSuggestion === 0) {
        return;
      }
      setActiveSuggestion(activeSuggestion - 1);
    }
    // User pressed the down arrow
    else if (e.key === 'ArrowDown') {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }
      setActiveSuggestion(activeSuggestion + 1);
    }
  };

  let suggestionsListComponent: any;

  if (showSuggestions && userInput) {
    if (filteredSuggestions.length) {
      suggestionsListComponent = (
        <UnorderedList>
          {filteredSuggestions.map((suggestion, index) => {
            let className: string;
            if (index === activeSuggestion) {
              className = "suggestion-active";
            }
            return (
              <ListItem id={suggestion} bg={index === activeSuggestion ? 'yellow.200' : "none"} key={suggestion} onClick={onClick}>
                {suggestion}
              </ListItem>
            );
          })}
        </UnorderedList>
      );
    } else {
      suggestionsListComponent = (
        <div className="no-suggestions">
          <em>No suggestions, you're on your own!</em>
        </div>
      );
    }
  }

  return (
    <>
      <FormControl id="sheet" isRequired>
        <FormLabel>Select Sheets</FormLabel>
        <Input onKeyDown={onKeyDown}
          onChange={onChange}
          value={userInput}
        />
      </FormControl>
      {suggestionsListComponent}
    </>
  )
}

export default AutoComplete
