import { isValid, parseISO } from 'date-fns';
import { isEmpty } from 'lodash';
import { ValueMapping } from "./models/interfaces";

function getBoolean(value: any) {
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return "true";
    default:
      return "false";
  }
}

export const validate = (mapping: ValueMapping, value: any) => {
  const number = Number(value);
  const validation = {
    TEXT: !isEmpty(String(value).trim()),
    LONG_TEXT: !isEmpty(String(value).trim()),
    LETTER: '',
    PHONE_NUMBER: !isNaN(number),
    EMAIL: '',
    BOOLEAN: ["yes", "no", "true", "false", "1", "0"].indexOf(String(value).toLowerCase()) !== -1,
    TRUE_ONLY: ["true", "yes", "1"].indexOf(String(value).toLowerCase()) !== -1,
    DATE: isValid(parseISO(value)),
    DATETIME: isValid(parseISO(value)),
    TIME: isValid(parseISO(value)),
    NUMBER: !isEmpty(String(value).trim()) && !isNaN(number),
    UNIT_INTERVAL: '',
    PERCENTAGE: '',
    INTEGER: !isEmpty(String(value).trim()) && !isNaN(number) && Number.isInteger(number),
    INTEGER_POSITIVE: !isNaN(number) && Number.isInteger(number) && number > 0,
    INTEGER_NEGATIVE: !isNaN(number) && Number.isInteger(number) && number < 0,
    INTEGER_ZERO_OR_POSITIVE: !isNaN(number) && Number.isInteger(number) && number >= 0,
    TRACKER_ASSOCIATE: '',
    USERNAME: !!String(value).trim(),
    COORDINATE: '',
    ORGANISATION_UNIT: '',
    AGE: isValid(parseISO(value)) || !isNaN(value),
    URL: '',
    FILE_RESOURCE: '',
    IMAGE: ''
  }
  return validation[mapping.valueType]
}

export const findValue = (mapping: ValueMapping, value: any): any => {
  if (['BOOLEAN', 'TRUE_ONLY'].indexOf(mapping.valueType) !== -1) {
    return getBoolean(String(value).toLowerCase())
  }
  return value;
}